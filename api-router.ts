import express from "express";
import { GoogleGenAI, Type } from "@google/genai";

const router = express.Router();

router.post("/generate-quiz", async (req, res) => {
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

    const difficultyGuidelines = {
      Easy: "Must focus on basic foundational concepts, simple terminology, direct facts, and introductory/basic knowledge. The incorrect options should be relatively easy to rule out for anyone with a simple understanding of the topic.",
      Medium: "Must focus on intermediate-level comprehension, relationships between ideas, practical application of rules, and standard misconceptions. Do NOT ask trivial, straightforward questions. The incorrect options must be highly plausible and require solid, non-trivial understanding of the topic to rule out.",
      Hard: "Must focus on highly advanced, specialized, or technical expert-level details, subtle definitions, complex multi-step deductions, historic exceptions, or expert-level concepts. The questions should challenge even highly knowledgeable individuals or professionals. Trivial or simple factual recall is absolutely forbidden. The incorrect options must be extremely subtle and look highly accurate to laypeople, representing professional-level misconceptions."
    };

    const currentGuidelines = (difficultyGuidelines as any)[difficulty] || difficultyGuidelines.Medium;

    for (const model of modelsToTry) {
      try {
        response = await ai.models.generateContent({
          model,
          contents: `Create a 5-question quiz about the topic: "${topic}". Category: ${category || "General"}. Difficulty: ${difficulty || "Medium"}.

          Strict Difficulty Requirement:
          The selected difficulty is "${difficulty || "Medium"}". You MUST strictly adhere to these specific guidelines for this difficulty level:
          ${currentGuidelines}

          Make sure that:
          1. The questions are genuinely written at the "${difficulty || "Medium"}" level. For "Medium" and "Hard" levels, do not generate questions that are easy or common knowledge. Elevate the complexity, wording, and conceptual density accordingly.
          2. Include exactly these question variations: Give at least 2 "multiple-choice" questions, 2 "true-false" questions, and 1 "fill-in-the-blank" question.
          3. Format the questions to be interesting, educational, and strictly matching the "${difficulty || "Medium"}" difficulty.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  questionType: { type: Type.STRING, description: "One of: multiple-choice, true-false, fill-in-the-blank" },
                  text: { type: Type.STRING, description: "The question text" },
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
                required: ["id", "questionType", "text", "correctAnswer", "explanation"],
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
    const mappedQuizData = Array.isArray(quizData)
      ? quizData.map((q: any) => ({
          id: q.id,
          type: q.questionType || q.type || "multiple-choice",
          text: q.text,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        }))
      : quizData;

    res.json(mappedQuizData);
  } catch (error: any) {
    console.error("Error generating quiz:", error);
    res.status(500).json({ error: error.message || "Failed to generate quiz" });
  }
});

export default router;
