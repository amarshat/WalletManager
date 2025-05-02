/**
 * This file contains all demo routes for the embedded widgets
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Register demo routes for testing embedded widgets
 * @param {import('express').Express} app 
 */
export default function registerDemoRoutes(app) {
  // Widget demo pages for testing - using static files in client/public/demo
  app.get('/demo/gaming', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'client/public/demo/demo-gaming.html'));
  });

  app.get('/demo/parking', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'client/public/demo/demo-parking.html'));
  });
  
  // Mobile demo route
  app.get('/demo/mobile', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'client/public/demo/demo-mobile.html'));
  });

  console.log('Demo routes registered with direct file paths');
}

// Export is handled by the 'export default' above