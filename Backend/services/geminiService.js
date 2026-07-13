import dotenv from "dotenv";
import fs from "fs";
import { fileURLToPath } from "url";

const envPath = fileURLToPath(new URL("../.env", import.meta.url));
const rootEnvPath = fileURLToPath(new URL("../../.env", import.meta.url));

function loadEnvFile(path) {
  if (!fs.existsSync(path)) {
    return;
  }

  const parsed = dotenv.parse(fs.readFileSync(path, "utf8"));
  Object.assign(process.env, parsed);
}

loadEnvFile(envPath);
loadEnvFile(rootEnvPath);

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing from the environment");
  }

  return apiKey;
}

async function generateQuiz(userPrompt) {
  const apiKey = getGeminiClient();
  const prompt = `You are an expert quiz generator.Generate quiz questions based on the user's request.Return ONLY valid JSON.Format:{  "title": "",  "description": "",  "difficulty": "",  "category": "",  "questions": [    {      "question": "",      "options": [        "",        "",        "",        ""      ],      "correctAnswer": 0,      "explanation": ""    }  ]}Rules:- Exactly 4 options.- correctAnswer is an index from 0 to 3.- Only one correct answer.- No markdown.- No extra text.- Output valid JSON only.User Request:${userPrompt}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini response did not include quiz text");
  }

  return JSON.parse(text);
}

export default generateQuiz;
