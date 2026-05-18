import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Recommendation Endpoint
  app.post("/api/ai/recommend", async (req, res) => {
    try {
      const { userPreferences, history } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Based on these preferences: ${userPreferences} and history: ${JSON.stringify(history)}, recommend 5 movies with titles and brief reasons. Format as JSON: { "recommendations": [{ "title": "...", "reason": "..." }] }`,
        config: { responseMimeType: "application/json" }
      });
      res.json(JSON.parse(response.text || "{}"));
    } catch (error: any) {
      console.error("AI Error:", error);
      
      // Handle quota exceeded specifically
      if (error?.message?.includes('429') || error?.status === 429) {
        return res.status(429).json({ 
          error: "Quota exceeded", 
          fallback: true,
          recommendations: [
            { title: "Inception", reason: "Sizga murakkab syujetli filmlar yoqadi." },
            { title: "The Martian", reason: "Kosmik sarguzashtlar ixlosmandlari uchun." },
            { title: "Tenet", reason: "Vaqt bilan bog'liq qiziqarli konsepsiya." },
            { title: "Arrival", reason: "O'zgacha yondashuvdagi ilmiy-fantastika." },
            { title: "Blade Runner 2049", reason: "Vizual jihatdan mukammal asar." }
          ]
        });
      }
      
      res.status(500).json({ error: "Failed to fetch recommendations" });
    }
  });

  // Translation route
  app.post("/api/ai/translate", async (req, res) => {
    try {
      const { text, targetLang } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Translate the following text to ${targetLang}. Only return the translated text without any explanations: "${text}"`,
      });
      res.json({ translatedText: response.text || text });
    } catch (error: any) {
      console.error("Translation Error:", error);
      res.status(500).json({ error: "Failed to translate" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
