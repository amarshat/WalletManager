import { Request, Response, NextFunction } from 'express';

/**
 * CORS middleware for widget integration
 * 
 * This middleware sets the proper CORS headers to allow widgets to be embedded in external sites
 * while maintaining security and enabling cookies/credentials to be sent
 */
export function setupCorsForWidgets(req: Request, res: Response, next: NextFunction) {
  // Default to allowing requests only from our own origin
  let allowedOrigin = req.headers.origin || '';
  
  // Determine if we should allow this origin
  // In production, you would have a whitelist of approved domains
  // For local development allow localhost
  const trustedOrigins = [
    'https://wallet.amar.im',           // Production website
    'http://localhost:3000',            // Local development 
    'http://localhost:5000',            // Local development
    'https://www.pixelracer.com',       // Approved external site (gaming)
    'https://www.ezpark.com',           // Approved external site (parking)
    // Add more trusted domains as needed
  ];
  
  // Only set CORS headers if the origin is in our trusted list
  if (trustedOrigins.includes(allowedOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // For API responses, set cache control headers
    if (req.path.startsWith('/api/')) {
      res.setHeader('Cache-Control', 'private, no-store, no-cache, must-revalidate');
    }
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
}

/**
 * Cookie settings middleware for proper SameSite policy
 * 
 * Ensures all cookies set by the application have proper SameSite settings
 * for cross-origin widget usage
 */
export function setupSecureCookies(req: Request, res: Response, next: NextFunction) {
  const originalSetCookie = res.setHeader;
  
  // Override setHeader to modify Set-Cookie headers
  res.setHeader = function(name, value) {
    if (name === 'Set-Cookie') {
      // Make sure value is always an array
      const cookies = Array.isArray(value) ? value : [value];
      
      // Transform each cookie to include SameSite=Lax and Secure attributes
      const securedCookies = cookies.map(cookie => {
        if (typeof cookie === 'string' && !cookie.includes('SameSite=')) {
          // Add SameSite=Lax and Secure if not already present
          return `${cookie}; SameSite=Lax; Secure`;
        }
        return cookie;
      });
      
      // Call the original setHeader with our modified cookies
      return originalSetCookie.call(this, name, securedCookies);
    }
    
    // Call original for other headers
    return originalSetCookie.call(this, name, value);
  };
  
  next();
}