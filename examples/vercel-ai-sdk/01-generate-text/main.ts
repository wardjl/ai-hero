import { config } from "dotenv";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

config();

const model = openai("gpt-4o-mini");

export const answerMyQuestion = async (
  prompt: string,
) => {
  const { text } = await generateText({
    model,
    prompt,
  });

  return text;
};

const answer = await answerMyQuestion(
  "what is the chemical formula for dihydrogen monoxide?",
);

console.log(answer);
