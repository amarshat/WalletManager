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
  app.get('/demo/gaming', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    try {
      // Use import.meta.dirname instead of __dirname for ESM
      const viewPath = path.join(import.meta.dirname, 'views', 'demo-gaming.html');
      const html = fs.readFileSync(viewPath, 'utf8');
      res.send(html);
    } catch (error) {
      console.error('Error reading gaming demo HTML:', error);
      res.status(500).send('Error loading gaming demo');
    }
  });
  
  app.get('/demo/parking', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    try {
      // Use import.meta.dirname instead of __dirname for ESM
      const viewPath = path.join(import.meta.dirname, 'views', 'demo-parking.html');
      const html = fs.readFileSync(viewPath, 'utf8');
      res.send(html);
    } catch (error) {
      console.error('Error reading parking demo HTML:', error);
      res.status(500).send('Error loading parking demo');
    }
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
