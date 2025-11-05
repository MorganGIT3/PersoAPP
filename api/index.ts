import express from "express";
import { registerRoutes } from "../server/routes";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes
let isInitialized = false;
let initPromise: Promise<void> | null = null;

async function initializeApp() {
  if (isInitialized) return;
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    // Register API routes
    await registerRoutes(app);
    
    // SPA routing: serve index.html for all non-API routes
    // On Vercel, static files are served automatically, so this only handles SPA routes
    app.get("*", (req, res) => {
      // Skip API routes and static assets
      if (req.path.startsWith("/api") || req.path.includes(".")) {
        return res.status(404).json({ message: "Not found" });
      }
      
      // Serve index.html for SPA routes
      const indexPath = path.join(process.cwd(), "dist/public/index.html");
      res.sendFile(indexPath, (err) => {
        if (err) {
          // Fallback HTML if file not found
          res.status(200).send(`
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>AppPerso</title>
              </head>
              <body>
                <div id="root"></div>
                <script>window.location.reload();</script>
              </body>
            </html>
          `);
        }
      });
    });
    
    isInitialized = true;
  })();
  
  return initPromise;
}

// Vercel serverless function handler
export default async (req: VercelRequest, res: VercelResponse) => {
  await initializeApp();
  app(req as any, res as any);
};
