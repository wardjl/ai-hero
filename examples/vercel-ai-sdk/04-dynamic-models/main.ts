import { config } from "dotenv";
import { openai } from "@ai-sdk/openai";
import { generateText, type LanguageModel } from "ai";

config();

export const ask = async (
  prompt: string,
  model: LanguageModel,
) => {
  const { text } = await generateText({
    model,
    prompt,
  });

  return text;
};

const prompt = `Tell me a story about your grandmother.`;

console.log("\n=== GPT-3.5 Response ===\n")
const openaiResult = await ask(
  prompt,
  openai("gpt-3.5-turbo"),
);
console.log(openaiResult)

console.log("\n=== GPT-4 Mini Response ===\n")
const openaiResult2 = await ask(
  prompt,
  openai("gpt-4o-mini"),
);
console.log(openaiResult2)
