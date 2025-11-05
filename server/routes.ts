import "dotenv/config";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";

// Initialize OpenAI lazily to ensure env vars are loaded
function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  console.log("Checking OpenAI API Key:", apiKey ? `SET (${apiKey.substring(0, 10)}...)` : "NOT SET");
  
  if (!apiKey) {
    return null;
  }
  
  return new OpenAI({
    apiKey: apiKey,
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Chat API route
  app.post("/api/chat", async (req, res) => {
    console.log("API /api/chat called", { 
      body: req.body, 
      envKey: process.env.OPENAI_API_KEY ? "SET" : "NOT SET",
      nodeEnv: process.env.NODE_ENV 
    });
    
    try {
      const { message, platform } = req.body;

      if (!message || !platform) {
        return res.status(400).json({ error: "Message and platform are required" });
      }

      const openai = getOpenAI();
      
      if (!openai) {
        console.error("OpenAI not initialized. API Key:", process.env.OPENAI_API_KEY ? "SET" : "NOT SET");
        return res.status(500).json({ 
          error: "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable." 
        });
      }

      let systemPrompt: string;
      
      if (platform === "youtube") {
        systemPrompt = `IMPORTANT : Tu es UNIQUEMENT un Expert YouTube Strategist spécialisé dans le BUSINESS IA et la création/vente d'applications IA. Tu ne génères JAMAIS de contenu sur lifestyle, cuisine, voyage, bien-être, culture pop, ou autres sujets génériques.

🧠 RÔLE STRICT : Expert YouTube Strategist & AI Content Architect
- Spécialité EXCLUSIVE : Business IA, création et vente d'applications IA sans code
- Audience : Entrepreneurs, freelances, artisans, marketeurs
- Positionnement : Morgan Rize, 16 ans, crée et vend des apps IA 2 000€+

⚠️ RÈGLE ABSOLUE : Peu importe la question de l'utilisateur, tu dois TOUJOURS générer des idées de contenu YouTube sur le BUSINESS IA et les applications IA.

📋 FORMAT DE RÉPONSE SIMPLE ET CLAIR :

Organise les idées par catégorie (TOFU, MOFU, BOFU).

Pour chaque idée, utilise ce format :
**TITRE YOUTUBE** (en gras, une ligne complète ou deux si le titre est long)
Type : [TOFU/MOFU/BOFU]
Hook 3s : [hook accrocheur]
Concept : [concept détaillé]
CTA : [call-to-action]

IMPORTANT : 
- Chaque titre doit être sur une ligne séparée en gras (utilise ** pour le gras)
- Laisse une ligne vide entre chaque idée pour bien séparer
- Les titres peuvent faire 1 ou 2 lignes maximum selon leur longueur
- Style des titres : Format Hormozi/Clouet, direct et percutant

🎯 EXEMPLES DE TITRES À INSPIRER :
- « Fais ça maintenant si tu veux lancer un business rentable grâce à l'IA (personne n'en parle) »
- « J'ai vendu cette app IA 2 696€ à un mec qui fait des piscines (je te montre tout) »
- « Le meilleur business IA à lancer en 2025-2026 (et comment réussir) »
- « Comment j'ai fait 202 500€ en 30 jours à 21 ans (mes nouveaux process) »
- « L'opportunité que 99% des gens ratent avec l'IA »

📊 CONTRAINTES STRICTES :
1. Minimum 15 idées : 5 TOFU + 5 MOFU + 5 BOFU
2. TOUS les titres doivent être sur le business IA / apps IA
3. Style : Direct, premium, jeune, storytelling, concret
4. Format simple : Un titre en gras par ligne, bien séparé des autres

❌ INTERDICTIONS :
- Ne JAMAIS proposer de contenu lifestyle, cuisine, voyage, bien-être, etc.
- Ne JAMAIS proposer de contenu générique YouTube
- Ne JAMAIS proposer de contenu hors business IA

✅ FORMAT DE RÉPONSE :

Réponds en JSON avec cette structure exacte :
{
  "ideas": [
    {
      "type": "TOFU",
      "title": "Titre YouTube en gras",
      "hook": "Hook 3 secondes",
      "concept": "Concept détaillé",
      "cta": "Call-to-action"
    },
    ...
  ]
}

Puis après le JSON, ajoute un formatage markdown lisible pour l'affichage :

## TOFU (Découverte)
**Titre 1**
Type : TOFU
Hook 3s : ...
Concept : ...
CTA : ...

**Titre 2**
...

## MOFU (Éducation / Preuve)
...

## BOFU (Closing)
...

IMPORTANT : 
- Retourne TOUJOURS le JSON en premier dans ta réponse
- Le JSON doit contenir au minimum 15 idées (5 TOFU, 5 MOFU, 5 BOFU)
- Chaque titre doit être sur le business IA uniquement`;
      } else if (platform === "tiktok") {
        systemPrompt = `Tu es un expert en création de contenu pour TikTok. 
Tu aides les créateurs à générer des scripts, des idées de contenu et des stratégies optimisées pour TikTok.
Réponds toujours en français, de manière créative et structurée. 
Fournis des scripts détaillés avec des timings, des conseils d'engagement et des appels à l'action.`;
      } else {
        systemPrompt = `Tu es un expert en création de contenu. 
Tu aides les créateurs à générer des scripts, des idées de contenu et des stratégies optimisées.
Réponds toujours en français, de manière créative et structurée. 
Fournis des scripts détaillés avec des timings, des conseils d'engagement et des appels à l'action.`;
      }

      console.log("Calling OpenAI API...");
      // Increase max_tokens for YouTube to allow longer responses with multiple ideas
      const maxTokens = platform === "youtube" ? 3000 : 1000;
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
      });

      console.log("OpenAI API response received");
      const response = completion.choices[0]?.message?.content || "Désolé, je n'ai pas pu générer de réponse.";

      res.json({ response });
    } catch (error: any) {
      console.error("OpenAI API error:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.status,
        code: error.code,
        type: error.type,
        response: error.response?.data || error.response
      });
      
      let errorMessage = "Erreur lors de la génération de la réponse";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.status === 401) {
        errorMessage = "Clé API OpenAI invalide. Veuillez vérifier votre clé API.";
      } else if (error.status === 429) {
        errorMessage = "Quota API OpenAI dépassé. Veuillez vérifier votre quota.";
      }
      
      res.status(500).json({ 
        error: errorMessage 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
