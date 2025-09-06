import { config } from "dotenv";
import { generateText } from "ai";
import { smallOpenAiModel } from "../../_shared/models.ts";

config();

const { usage } = await generateText({
  model: smallOpenAiModel,
  prompt: "Tell me a story about a dragon.",
});

/**
 * The number of tokens used in the prompt.
 */
console.log(usage.promptTokens);

/**
 * The number of tokens used in the completion.
 */
console.log(usage.completionTokens);
