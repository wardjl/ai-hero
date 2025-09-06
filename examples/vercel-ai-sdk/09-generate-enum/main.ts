import { config } from "dotenv";
import { generateObject } from "ai";
import { smallOpenAiModel } from "../../_shared/models.ts";

const model = smallOpenAiModel;
config();

export const classifySentiment = async (
  text: string,
) => {
  const { object } = await generateObject({
    model,
    output: "enum",
    enum: ["positive", "negative", "neutral"],
    prompt: text,
    system:
      `Classify the sentiment of the text as either ` +
      `positive, negative, or neutral.`,
  });

  return object;
};

const result = await classifySentiment(
  `pretty good video, you could work on the editing`,
);

console.log(result); // negative
