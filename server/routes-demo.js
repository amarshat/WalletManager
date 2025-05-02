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
  // Widget demo pages for testing
  app.get('/demo/gaming', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    // Read the gaming demo HTML file
    try {
      const html = fs.readFileSync(path.join(__dirname, 'views/demo-gaming.html'), 'utf8');
      res.send(html);
    } catch (error) {
      console.error('Error reading gaming demo HTML:', error);
      res.status(500).send('Error loading gaming demo');
    }
  });

  app.get('/demo/parking', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    // Read the parking demo HTML file
    try {
      const html = fs.readFileSync(path.join(__dirname, 'views/demo-parking.html'), 'utf8');
      res.send(html);
    } catch (error) {
      console.error('Error reading parking demo HTML:', error);
      res.status(500).send('Error loading parking demo');
    }
  });
}

// Export is handled by the 'export default' above