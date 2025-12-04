import OpenAI from "openai";
import { Language, LearningReport, Question } from "../types";

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
  if (typeof response === "string") return response;

  if (response?.output_text && Array.isArray(response.output_text)) {
    return response.output_text.join("\n").trim();
  }

  if (response?.output && Array.isArray(response.output)) {
    const chunks: string[] = [];
    for (const block of response.output) {
      if (Array.isArray(block.content)) {
        for (const item of block.content) {
          if (item.type === "output_text" && typeof item.text === "string") {
            chunks.push(item.text);
          } else if (item.type === "text") {
            if (typeof item.text === "string") chunks.push(item.text);
            else if (item.text?.value) chunks.push(item.text.value);
          }
        }
      }
    }
    if (chunks.length) return chunks.join("\n").trim();
  }

  if (response?.output && typeof response.output === "string") {
    return response.output;
  }

  if (response?.text && typeof response.text === "string") {
    return response.text;
  }

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
    required: ["safe", "reason"],
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

const learningReportSchema = {
  name: "LearningOutcomeReport",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      summary: { type: "string" },
      outcomes: {
        type: "array",
        minItems: 1,
        items: { type: "string" },
      },
      focusAreas: {
        type: "array",
        items: { type: "string" },
      },
    },
    required: ["summary", "outcomes"],
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
      response_format: "b64_json",
    });
    const base64 = result.data?.[0]?.b64_json;
    if (base64) {
      return toDataUrl(base64);
    }
    const fallbackUrl = result.data?.[0]?.url;
    return fallbackUrl;
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
      text: {
        format: {
          type: "json_schema",
          name: questionPlanSchema.name,
          schema: questionPlanSchema.schema,
        },
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

    const imageKeywords = [
      "şekil",
      "sekil",
      "grafik",
      "diyagram",
      "tablo",
      "şema",
      "figure",
      "diagram",
      "chart",
      "shape",
      "picture",
      "image",
    ];

    const needsVisualCue = (text: string) => {
      const lower = text.toLowerCase();
      return imageKeywords.some((kw) => lower.includes(kw));
    };

    const questions: Question[] = [];
    for (const [index, plan] of payload.questions.entries()) {
      const shouldForceImage =
        !plan.needsImage && needsVisualCue(plan.text || "");
      let imageUrl: string | undefined;
      if ((plan.needsImage || shouldForceImage) && plan.imagePrompt) {
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

let safetyLanguage: Language = "tr";

export const setSafetyLanguage = (language: Language) => {
  safetyLanguage = language;
};

export async function checkContentSafety(
  content: string
): Promise<{ safe: boolean; reason?: string }> {
  try {
    if (!aiClient) {
      console.warn("OpenAI API key missing. Skipping safety check.");
      return { safe: true };
    }

    const client = ensureClient();
    const targetLanguage = safetyLanguage === "tr" ? "Turkish" : "English";
    const response = await client.responses.create({
      model: TEXT_MODEL,
      text: {
        format: {
          type: "json_schema",
          name: safetySchema.name,
          schema: safetySchema.schema,
        },
      },
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: `You moderate content for a K-12 social network. Flag bullying, hate speech, or unsafe behavior. Always write the 'reason' in ${targetLanguage}, referencing any flagged terms clearly so that students understand why the content was blocked.`,
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Language: ${targetLanguage}
Text: """${content}"""`,
            },
          ],
        },
      ],
    });

    const result = JSON.parse(extractOutputText(response) || "{}");
    return { safe: !!result.safe, reason: result.reason };
  } catch (error) {
    console.error("Safety Check Error:", error);
    return { safe: true };
  }
}

interface LearningReportQuestionInput {
  index: number;
  question: string;
  correctAnswer: string;
  studentAnswer?: string | null;
  isCorrect: boolean;
}

export interface GenerateLearningReportParams {
  examTitle: string;
  subjectName?: string;
  topic?: string;
  difficulty: string;
  score: number;
  totalQuestions: number;
  language: Language;
  questions: LearningReportQuestionInput[];
  gradeLevel?: number;
}

const buildFallbackLearningReport = ({
  examTitle,
  subjectName,
  topic,
  difficulty,
  score,
  totalQuestions,
  language,
  questions,
}: GenerateLearningReportParams): Omit<LearningReport, "generatedAt"> => {
  const localized = language === "tr";
  const accuracy =
    totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const labelSubject =
    subjectName || (localized ? "Genel Dersler" : "General Subjects");
  const labelTopic = topic || (localized ? "Genel Konular" : "General Topics");
  const diffLabel = localized
    ? difficulty === "Hard"
      ? "Zor"
      : difficulty === "Medium"
      ? "Orta"
      : "Kolay"
    : difficulty;

  const summary = localized
    ? accuracy >= 70
      ? `Tebrikler! "${examTitle}" sınavında ${totalQuestions} sorudan ${score} doğru yaparak %${accuracy} başarı elde ettin.`
      : accuracy >= 40
      ? `"${examTitle}" sınavında ${totalQuestions} sorudan ${score} doğru yaptın. Hadi bu temeli güçlendirelim.`
      : `"${examTitle}" sınavında henüz istediğin sonuca ulaşamadın ancak her çözüm bir adımdır.`
    : accuracy >= 70
    ? `Great job! You answered ${score} of ${totalQuestions} questions correctly on "${examTitle}" (${accuracy}%).`
    : accuracy >= 40
    ? `You answered ${score}/${totalQuestions} on "${examTitle}". Let's reinforce that foundation.`
    : `Results on "${examTitle}" weren’t what you hoped, but every attempt moves you forward.`;

  const outcomes: string[] = [];
  if (accuracy >= 80) {
    outcomes.push(
      localized
        ? `${labelSubject} alanında ${diffLabel} seviyedeki soruları akıcı biçimde tamamladın.`
        : `You handled ${diffLabel}-level ${labelSubject} questions with ease.`
    );
    outcomes.push(
      localized
        ? `${labelTopic} konularında kavramlar arası bağlantı kurabildiğini gösterdin.`
        : `You demonstrated strong connections across ${labelTopic} concepts.`
    );
  } else if (accuracy >= 50) {
    outcomes.push(
      localized
        ? `${labelSubject} alanındaki temel soruların çoğunda doğru stratejileri kullandın.`
        : `You applied the right strategies on most core ${labelSubject} questions.`
    );
    outcomes.push(
      localized
        ? `${labelTopic} konularında ilerleme kaydettin; ufak tekrarlarla hızlanabilirsin.`
        : `You progressed through ${labelTopic}; a bit of review will boost your pace.`
    );
  } else {
    outcomes.push(
      localized
        ? `${labelSubject} alanında temel kavramları yeniden gözden geçirmek için iyi bir zaman.`
        : `It’s a good time to revisit foundational ${labelSubject} ideas.`
    );
    outcomes.push(
      localized
        ? `${labelTopic} sorularını adım adım çözmek, doğruluk oranını artıracaktır.`
        : `Working through ${labelTopic} exercises step by step will raise accuracy.`
    );
  }

  const incorrect = questions.filter((q) => !q.isCorrect);
  const truncateText = (text: string, limit = 90) =>
    text.length > limit ? `${text.slice(0, limit).trim()}...` : text;

  let focusAreas: string[];
  if (incorrect.length === 0) {
    focusAreas =
      accuracy >= 80
        ? [
            localized
              ? "Harika performans! Yeni konulara geçerek kendini zorlayabilirsin."
              : "Excellent work! Challenge yourself with new topics next.",
          ]
        : [
            localized
              ? "Sonraki denemede zaman yönetimine dikkat ederek aynı tempoda ilerle."
              : "Maintain your pace and focus on timing in the next attempt.",
          ];
  } else {
    focusAreas = incorrect.slice(0, 2).map((q) =>
      localized
        ? `Soru ${q.index + 1}: "${truncateText(
            q.question
          )}" kısmını tekrar incele.`
        : `Review question ${q.index + 1}: "${truncateText(q.question)}".`
    );
    if (incorrect.length > 2) {
      focusAreas.push(
        localized
          ? "Diğer yanlış sorular için benzer soru tipleriyle alıştırma yap."
          : "Practice similar formats for the remaining incorrect questions."
      );
    }
  }

  return {
    summary,
    outcomes,
    focusAreas,
  };
};

export const generateLearningReport = async ({
  examTitle,
  subjectName,
  topic,
  difficulty,
  score,
  totalQuestions,
  language,
  questions,
  gradeLevel,
}: GenerateLearningReportParams): Promise<Omit<LearningReport, "generatedAt">> => {
  if (!aiClient) {
    console.warn("OpenAI API key missing. Using fallback learning report.");
    return buildFallbackLearningReport({
      examTitle,
      subjectName,
      topic,
      difficulty,
      score,
      totalQuestions,
      language,
      questions,
      gradeLevel,
    });
  }

  try {
    const client = ensureClient();
    const targetLanguage = language === "tr" ? "Turkish" : "English";

    const questionNarrative = questions
      .map(
        (q) =>
          `Q${q.index + 1}: ${q.question}
Correct: ${q.correctAnswer}
Student: ${q.studentAnswer ?? "Skipped"}
Result: ${q.isCorrect ? "Correct" : "Incorrect"}`
      )
      .join("\n\n");

    const response = await client.responses.create({
      model: TEXT_MODEL,
      text: {
        format: {
          type: "json_schema",
          name: learningReportSchema.name,
          schema: learningReportSchema.schema,
        },
      },
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: `You are an encouraging K-12 counselor. Summarize the student's learning gains after an exam. Respond in ${targetLanguage} using concise, student-friendly language. Highlight concrete skills mastered and suggest gentle next steps if needed.`,
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Exam Title: ${examTitle}
Subject: ${subjectName || "Unknown"}
Topic: ${topic || "General"}
Difficulty: ${difficulty}
Grade Level: ${gradeLevel ?? "Unknown"}
Score: ${score}/${totalQuestions}

Question Review:
${questionNarrative}

Provide:
1. "summary": 1-2 sentences celebrating achievements.
2. "outcomes": array of 2-3 bullet sentences describing concrete kazanımlar/skills learned.
3. "focusAreas": array of up to 2 gentle suggestions for next practice (empty array if not needed).`,
            },
          ],
        },
      ],
    });

    const parsed = JSON.parse(extractOutputText(response) || "{}");
    const outcomes =
      Array.isArray(parsed.outcomes) && parsed.outcomes.length > 0
        ? parsed.outcomes
        : [
            language === "tr"
              ? "Bu sınavdan elde edilen kazanımlar özetlenemedi."
              : "Learning outcomes could not be summarized.",
          ];

    return {
      summary:
        typeof parsed.summary === "string" && parsed.summary.trim()
          ? parsed.summary.trim()
          : language === "tr"
          ? "Kazanım özeti hazırlanamadı."
          : "Learning summary is not available.",
      outcomes,
      focusAreas: Array.isArray(parsed.focusAreas) ? parsed.focusAreas : [],
    };
  } catch (error) {
    console.error("Learning Report Error:", error);
    return buildFallbackLearningReport({
      examTitle,
      subjectName,
      topic,
      difficulty,
      score,
      totalQuestions,
      language,
      questions,
      gradeLevel,
    });
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
      text: {
        format: {
          type: "json_schema",
          name: explanationSchema.name,
          schema: explanationSchema.schema,
        },
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
      text: {
        format: {
          type: "json_schema",
          name: singleQuestionSchema.name,
          schema: singleQuestionSchema.schema,
        },
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
