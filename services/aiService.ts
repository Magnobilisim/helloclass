import OpenAI from "openai";
import { Language, Question } from "../types";

const env = typeof import.meta !== "undefined" ? import.meta.env : undefined;

const OPENAI_API_KEY =
  env?.VITE_OPENAI_API_KEY ||
  (typeof process !== "undefined"
    ? process.env?.VITE_OPENAI_API_KEY || process.env?.OPENAI_API_KEY
    : "") ||
  "";

const TEXT_MODEL = env?.VITE_OPENAI_TEXT_MODEL || "gpt-4.1-mini";
const IMAGE_MODEL = env?.VITE_OPENAI_IMAGE_MODEL || "gpt-image-1";

const createClient = () => {
  if (!OPENAI_API_KEY) return null;
  return new OpenAI({
    apiKey: OPENAI_API_KEY,
    // Front-end demo usage only. For production move to a secure backend.
    dangerouslyAllowBrowser: true,
  });
};

const aiClient = createClient();

const ensureClient = () => {
  if (!aiClient) {
    throw new Error(
      "OpenAI API key missing. Set VITE_OPENAI_API_KEY in your environment."
    );
  }
  return aiClient;
};

const extractOutputText = (response: any): string => {
  if (response?.output_text?.length) {
    return response.output_text.join("\n").trim();
  }

  if (Array.isArray(response?.output)) {
    const chunks: string[] = [];
    for (const block of response.output) {
      if (Array.isArray(block.content)) {
        for (const item of block.content) {
          if (item.type === "output_text" && item.text) {
            chunks.push(item.text);
          }
          if (item.type === "text" && item.text?.value) {
            chunks.push(item.text.value);
          }
        }
      }
    }
    if (chunks.length) return chunks.join("\n").trim();
  }

  if (typeof response === "string") return response;
  return "";
};

interface PlannedQuestion {
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  needsImage: boolean;
  imagePrompt?: string;
}

export interface GenerateExamParams {
  subjectName: string;
  gradeOrLevel: string;
  topic?: string;
  questionCount?: number;
  language?: Language;
}

const defaultExplanation = (language: Language) =>
  language === "tr"
    ? "Bu sorunun açıklaması henüz hazırlanmadı."
    : "No explanation provided yet.";

const toDataUrl = (base64: string) => {
  if (base64.startsWith("data:")) return base64;
  return `data:image/png;base64,${base64}`;
};

const questionPlanSchema = {
  name: "ExamQuestionPlan",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      questions: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            text: { type: "string" },
            options: {
              type: "array",
              minItems: 4,
              maxItems: 4,
              items: { type: "string" },
            },
            correctIndex: { type: "integer", minimum: 0, maximum: 3 },
            explanation: { type: "string" },
            needsImage: { type: "boolean" },
            imagePrompt: { type: "string" },
          },
          required: [
            "text",
            "options",
            "correctIndex",
            "needsImage",
            "explanation",
            "imagePrompt",
          ],
        },
      },
    },
    required: ["questions"],
  },
};

const safetySchema = {
  name: "SafetyCheck",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      safe: { type: "boolean" },
      reason: { type: "string" },
    },
    required: ["safe"],
  },
};

const explanationSchema = {
  name: "AnswerExplanation",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      explanation: { type: "string" },
    },
    required: ["explanation"],
  },
};

const singleQuestionSchema = {
  name: "ImageQuestionExtraction",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      text: { type: "string" },
      options: {
        type: "array",
        minItems: 4,
        maxItems: 4,
        items: { type: "string" },
      },
      correctIndex: { type: "integer", minimum: 0, maximum: 3 },
      explanation: { type: "string" },
    },
    required: ["text", "options", "correctIndex"],
  },
};

const generateQuestionImage = async (
  prompt: string
): Promise<string | undefined> => {
  try {
    const client = ensureClient();
    const result = await client.images.generate({
      model: IMAGE_MODEL,
      prompt: `Educational exam illustration with clean lines, no text labels. ${prompt}`,
      size: "512x512",
    });
    return result.data?.[0]?.url;
  } catch (error) {
    console.error("Image generation error:", error);
    return undefined;
  }
};

export const generateExamQuestions = async ({
  subjectName,
  gradeOrLevel,
  topic,
  questionCount = 5,
  language = "tr",
}: GenerateExamParams): Promise<Question[]> => {
  try {
    const client = ensureClient();

    const response = await client.responses.create({
      model: TEXT_MODEL,
      response_format: {
        type: "json_schema",
        name: questionPlanSchema.name,
        schema: questionPlanSchema.schema,
      },
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: `You are an experienced K12 teacher. Create multiple-choice questions in ${language === "tr" ? "Turkish" : "English"} with 4 options, age-appropriate language, and curriculum alignment.`,
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Prepare ${questionCount} questions for ${subjectName}. Target group: ${gradeOrLevel}. ${
                topic ? `Topic focus: ${topic}.` : ""
              }
Decide yourself if a question requires a visual diagram or chart. If it does, set "needsImage": true and provide an "imagePrompt" describing the diagram without referencing text.
Return JSON that matches the schema.`,
            },
          ],
        },
      ],
    });

    const jsonString = extractOutputText(response);
    if (!jsonString) {
      throw new Error("AI yanıtı alınamadı.");
    }

    const payload = JSON.parse(jsonString) as { questions: PlannedQuestion[] };

    const questions: Question[] = [];
    for (const [index, plan] of payload.questions.entries()) {
      let imageUrl: string | undefined;
      if (plan.needsImage && plan.imagePrompt) {
        imageUrl = await generateQuestionImage(plan.imagePrompt);
      }

      questions.push({
        id: `ai-q-${Date.now()}-${index}`,
        text: plan.text,
        options: plan.options,
        correctIndex: plan.correctIndex,
        explanation: plan.explanation || defaultExplanation(language),
        imageUrl,
      });
    }

    return questions;
  } catch (error: any) {
    console.error("OpenAI Question Error:", error);
    let message =
      language === "tr"
        ? "Sınav soruları oluşturulamadı."
        : "Failed to generate exam questions.";

    if (error?.message?.includes("OpenAI API key")) {
      message =
        language === "tr"
          ? error.message
          : "OpenAI API key missing. Please configure VITE_OPENAI_API_KEY.";
    } else if (error?.status === 429) {
      message =
        language === "tr"
          ? "Sistem yoğun. Lütfen birkaç dakika sonra tekrar deneyin."
          : "Usage limits exceeded. Try again soon.";
    }

    throw new Error(message);
  }
};

export const checkContentSafety = async (
  content: string
): Promise<{ safe: boolean; reason?: string }> => {
  try {
    if (!aiClient) {
      console.warn("OpenAI API key missing. Skipping safety check.");
      return { safe: true };
    }

    const client = ensureClient();
    const response = await client.responses.create({
      model: TEXT_MODEL,
      response_format: {
        type: "json_schema",
        name: safetySchema.name,
        schema: safetySchema.schema,
      },
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "You moderate content for a K-12 social network. Flag bullying, hate speech, or unsafe behavior.",
            },
          ],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: `Text: """${content}"""` }],
        },
      ],
    });

    const result = JSON.parse(extractOutputText(response) || "{}");
    return { safe: !!result.safe, reason: result.reason };
  } catch (error) {
    console.error("Safety Check Error:", error);
    return { safe: true };
  }
};

export const getAnswerExplanation = async (
  questionText: string,
  options: string[],
  correctIndex: number,
  studentAnswerIndex: number | null,
  language: Language = "tr"
): Promise<string> => {
  try {
    const client = ensureClient();
    const response = await client.responses.create({
      model: TEXT_MODEL,
      response_format: {
        type: "json_schema",
        name: explanationSchema.name,
        schema: explanationSchema.schema,
      },
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: `Provide concise, encouraging explanations in ${
                language === "tr" ? "Turkish" : "English"
              }.`,
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Question: ${questionText}
Options: ${options.join(" | ")}
Correct answer: ${options[correctIndex]}
${
  studentAnswerIndex !== null
    ? `Student answer: ${options[studentAnswerIndex]}`
    : "Student skipped."
}`,
            },
          ],
        },
      ],
    });

    const parsed = JSON.parse(extractOutputText(response) || "{}");
    return parsed.explanation || defaultExplanation(language);
  } catch (error) {
    console.error("Explanation Error:", error);
    return language === "tr"
      ? "Açıklama oluşturulamadı. Lütfen tekrar deneyin."
      : "Unable to generate explanation.";
  }
};

export const parseQuestionFromImage = async (
  base64Data: string
): Promise<PlannedQuestion | null> => {
  try {
    const client = ensureClient();
    const response = await client.responses.create({
      model: TEXT_MODEL,
      response_format: {
        type: "json_schema",
        name: singleQuestionSchema.name,
        schema: singleQuestionSchema.schema,
      },
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "You are an OCR assistant that extracts multiple-choice questions from images.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Extract the question, 4 options, and explanation if visible.",
            },
            { type: "input_image", image_url: toDataUrl(base64Data) },
          ],
        },
      ],
    });

    const parsed = JSON.parse(extractOutputText(response) || "{}");
    return parsed as PlannedQuestion;
  } catch (error) {
    console.error("Image Parse Error:", error);
    return null;
  }
};
