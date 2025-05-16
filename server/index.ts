import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { errorHandler } from './diagnostics/error-tracking';
import { setupCorsForWidgets, setupSecureCookies } from './cors-middleware';
import fs from 'fs';
import path from 'path';
// Import demo routes for embedded widgets will be done dynamically

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Set up middleware for widget integration
app.use(setupCorsForWidgets);
app.use(setupSecureCookies);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);
  
  // Register the demo routes for embedded widgets
  try {
    // Use dynamic import for routes-demo.js
    import('./routes-demo.js').then(module => {
      const registerDemoRoutes = module.default || module;
      registerDemoRoutes(app);
      log('Demo routes registered successfully');
    }).catch(err => {
      console.error('Failed to load demo routes:', err);
    });
  } catch (err) {
    console.error('Error registering demo routes:', err);
  }
  
  // Manually register demo routes to ensure they work in production
  // These routes will redirect to the static files in client/public/demo
  app.get('/demo/gaming', (req, res) => {
    res.redirect('/demo/demo-gaming.html');
  });
  
  app.get('/demo/parking', (req, res) => {
    res.redirect('/demo/demo-parking.html');
  });
  
  app.get('/demo/mobile', (req, res) => {
    res.redirect('/demo/demo-mobile.html');
  });
  
  app.get('/demo/religious', (req, res) => {
    res.redirect('/demo/demo-religious.html');
  });
  
  // Add route for themed wallet
  app.get('/themed-wallet', (req, res) => {
    // Forward to the frontend to handle the route
    res.sendFile(path.join(process.cwd(), 'client/index.html'));
  });

  // Use the error handler middleware
  app.use(errorHandler);
  
  // Fallback error handler (should rarely be used)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Fallback error handler caught:", err);
    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
