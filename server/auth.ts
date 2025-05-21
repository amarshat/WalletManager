import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { z } from "zod";
import { walletClient } from "./wallet-client";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  // Check if password is stored in hashed format (contains a dot separator for hash and salt)
  if (stored.includes('.')) {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } else {
    // For plain text passwords (temporary solution for existing accounts)
    return supplied === stored;
  }
}

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address").optional(),
  country: z.string().optional(),
  defaultCurrency: z.string().optional(),
  isAdmin: z.boolean().optional()
});

const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "paysafe-gpt-wallet-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: { 
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      sameSite: 'lax',
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      // Get the tenant ID from query params - it could be a numeric ID or a tenant slug
      const tenantIdParam = req.query.tenantId as string | undefined;
      let tenantId: number | undefined;
      
      // If tenant ID is provided, try to resolve it to a numeric ID
      if (tenantIdParam) {
        try {
          // First try to parse it as a number
          const parsedId = parseInt(tenantIdParam);
          
          if (!isNaN(parsedId)) {
            // If it's a valid number, use it directly
            tenantId = parsedId;
          } else {
            // Otherwise, try to look up the tenant by slug/tenantId
            const tenant = await storage.getTenantBySlug(tenantIdParam);
            if (tenant) {
              tenantId = tenant.id;
            }
          }
        } catch (error) {
          console.error("Error resolving tenant ID:", error);
        }
      }
      
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const user = await storage.createUser({
        ...validatedData,
        password: await hashPassword(validatedData.password),
      });
      
      // If tenantId was provided, associate the user with the tenant
      if (tenantId) {
        try {
          // Add user to tenant with default "user" role
          await storage.addUserToTenant({
            userId: user.id,
            tenantId,
            role: "user",
            isDefault: true // Make this the default tenant for the user
          });
        } catch (error) {
          console.error("Error associating user with tenant:", error);
          // Continue with registration even if tenant association fails
        }
      }

      // Create wallet for the new user
      try {
        const walletResponse = await walletClient.createWallet(user.id, {
          customer: {
            firstName: user.fullName.split(' ')[0],
            lastName: user.fullName.split(' ').slice(1).join(' ') || user.fullName.split(' ')[0],
            email: user.email || `${user.username}@example.com`,
            id: user.id.toString()
          }
        });
        
        // Create a local wallet record
        if (walletResponse.id) {
          await storage.createWallet({
            userId: user.id,
            customerId: walletResponse.id,
            externalReference: walletResponse.externalReference || null,
            status: walletResponse.status || 'ACTIVE'
          });
          
          // Create accounts for the wallet if needed
          if (walletResponse.accounts && Array.isArray(walletResponse.accounts)) {
            const wallet = await storage.getWalletByUserId(user.id);
            if (wallet) {
              for (const account of walletResponse.accounts) {
                await storage.addWalletAccount({
                  walletId: wallet.id,
                  accountId: account.id,
                  currencyCode: account.currencyCode,
                  externalId: account.externalId || null,
                  hasVirtualInstrument: account.hasVirtualInstrument || false
                });
              }
            }
          }
        }
      } catch (walletError) {
        console.error("Error creating wallet for user:", walletError);
        // Continue with login even if wallet creation fails
      }

      req.login(user, (err) => {
        if (err) return next(err);
        
        // Don't send password back
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    try {
      loginSchema.parse(req.body);
      
      passport.authenticate("local", (err: Error, user: SelectUser) => {
        if (err) return next(err);
        if (!user) {
          return res.status(401).json({ error: "Invalid username or password" });
        }
        
        req.login(user, (err) => {
          if (err) return next(err);
          
          // Don't send password back
          const { password, ...userWithoutPassword } = user;
          res.status(200).json(userWithoutPassword);
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      next(error);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Don't send password back
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  });
  
  // Check if we need to create admin user
  (async () => {
    try {
      const adminUser = await storage.getUserByUsername("wlw_admin");
      
      if (!adminUser) {
        // Create admin user
        await storage.createUser({
          username: "wlw_admin",
          password: await hashPassword("6528D232-3F93-4A8D-B5B1-6FD37411C971"),
          fullName: "Wallet Admin",
          isAdmin: true,
          defaultCurrency: "USD"
        });
        
        console.log("Admin user created");
      }
    } catch (error) {
      console.error("Error checking/creating admin user:", error);
    }
  })();
}
