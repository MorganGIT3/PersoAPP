import express from "express";
import { registerRoutes } from "../server/routes";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes and server
let isInitialized = false;
let initPromise: Promise<void> | null = null;

async function initializeApp() {
  if (isInitialized) return;
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    // Register API routes (these will be under /api prefix)
    // Note: registerRoutes returns a Server but we don't need it for Vercel
    await registerRoutes(app);
    
    // On Vercel, static files are served automatically from outputDirectory
    // We only need to handle SPA routing (serve index.html for non-API routes)
    const indexPath = path.join(__dirname, "../dist/public/index.html");
    
    // Serve index.html for all non-API routes (SPA fallback)
    app.get("*", (req, res) => {
      // Only serve index.html for non-API routes
      if (!req.path.startsWith("/api")) {
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(404).send("Not found");
        }
      } else {
        res.status(404).json({ message: "API route not found" });
      }
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

