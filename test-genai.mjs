import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
const envFile = fs.readFileSync('.env.local', 'utf8');
const apiKey = envFile.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.*)/)?.[1]?.trim();

const genAI = new GoogleGenerativeAI(apiKey);

async function test(query) {
  try {
    console.log("Testing Gemini 1.5 Flash (Legacy SDK) with Search Grounding...");
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview",
      tools: [{ googleSearch: {} }]
    });

    const result = await model.generateContent(query);
    console.log("Success!");
    console.log(result.response.text());
  } catch (error) {
    console.error("Error detected:");
    console.error(error);
  }
}

test("What is the current TVL of Hyperliquid?");
