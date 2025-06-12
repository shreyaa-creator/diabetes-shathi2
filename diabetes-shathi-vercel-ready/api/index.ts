import { createServer } from 'http';
import express from 'express';
import { registerRoutes } from '../server/routes.js';

const app = express();

// Enable JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add CORS headers for Vercel
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Register API routes
const server = await registerRoutes(app);

// Export the Express app for Vercel
export default app;