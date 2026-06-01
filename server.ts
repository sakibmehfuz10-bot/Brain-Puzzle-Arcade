import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API router
  app.post("/api/generate-quiz", async (req, res) => {
    try {
      const { topic, category, difficulty } = req.body;
      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
      }

      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      let response;
      let lastError;
      const modelsToTry = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.5-flash"];

      for (const model of modelsToTry) {
        try {
          response = await ai.models.generateContent({
            model,
            contents: `Create a 5-question quiz about the topic: "${topic}". Category: ${category || 'General'}. Difficulty: ${difficulty || 'Medium'}.
            Include exactly these variations in your quiz questions: Give at least 1 "multiple-choice" question, 1 "true-false" question, 1 "fill-in-the-blank" question, and 1 "image-based" question.
            For image-based questions, provide an Unsplash image URL related to the question as the "imageUrl" (e.g. https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=800&q=80).
            Make the questions interesting and educational, appropriate for the specified difficulty.`,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING, description: "One of: multiple-choice, true-false, fill-in-the-blank, image-based" },
                    text: { type: Type.STRING, description: "The question text" },
                    imageUrl: { type: Type.STRING, description: "Optional image URL for image-based questions. Use a valid unsplash URL like https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=800&q=80" },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Provide options ONLY for multiple-choice (4 options) and true-false (2 options: 'True' or 'False'). Leave empty for fill-in-the-blank.",
                    },
                    correctAnswer: {
                      type: Type.STRING,
                      description: "The correct option exactly matching one of the options, or the correct word for fill-in-the-blank.",
                    },
                    explanation: {
                      type: Type.STRING,
                      description: "A short explanation of why the answer is correct",
                    },
                  },
                  required: ["id", "type", "text", "correctAnswer", "explanation"],
                },
              },
            },
          });
          // If successful, break out of the retry loop
          break;
        } catch (err: any) {
          console.warn(`Model ${model} failed or returned error:`, err.message || err);
          lastError = err;
        }
      }

      if (!response) {
        throw lastError || new Error("All tried models failed to generate content");
      }
 
      const text = response.text;
      if (!text) throw new Error("No text response from Gemini");
 
      let cleanText = text.trim();
      if (cleanText.startsWith("```")) {
        cleanText = cleanText.replace(/^```[a-zA-Z]*\n?/, "");
        cleanText = cleanText.replace(/\n?```$/, "");
        cleanText = cleanText.trim();
      }

      const quizData = JSON.parse(cleanText);
      res.json(quizData);
    } catch (error: any) {
      console.error("Error generating quiz:", error);
      res.status(500).json({ error: error.message || "Failed to generate quiz" });
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
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
