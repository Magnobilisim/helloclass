
import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

const env = typeof import.meta !== 'undefined' ? import.meta.env : undefined;
const GEMINI_API_KEY =
  env?.VITE_GEMINI_API_KEY ||
  (typeof process !== 'undefined' ? process.env?.VITE_GEMINI_API_KEY || process.env?.API_KEY : '') ||
  '';

const createClient = () => {
  if (!GEMINI_API_KEY) return null;
  return new GoogleGenAI({ apiKey: GEMINI_API_KEY });
};

const ai = createClient();

const ensureClient = () => {
  if (!ai) {
      throw new Error('Gemini API key missing. Set VITE_GEMINI_API_KEY in your environment.');
  }
  return ai;
};

// Schema for structured output
const questionSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctIndex: { type: Type.INTEGER },
          explanation: { type: Type.STRING }
        },
        required: ["text", "options", "correctIndex"]
      }
    }
  }
};

const singleQuestionSchema = {
  type: Type.OBJECT,
  properties: {
    text: { type: Type.STRING },
    options: { type: Type.ARRAY, items: { type: Type.STRING } },
    correctIndex: { type: Type.INTEGER },
    explanation: { type: Type.STRING }
  },
  required: ["text", "options", "correctIndex"]
};

const safetySchema = {
  type: Type.OBJECT,
  properties: {
    safe: { type: Type.BOOLEAN },
    reason: { type: Type.STRING }
  },
  required: ["safe"]
};

const explanationSchema = {
  type: Type.OBJECT,
  properties: {
    explanation: { type: Type.STRING }
  },
  required: ["explanation"]
};

interface GeneratedQuestion {
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

// Helper to clean Markdown from JSON response
const cleanJson = (text: string): string => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const generateExamQuestions = async (
  subject: string,
  level: string,
  count: number = 5
): Promise<Question[]> => {
  try {
    const client = ensureClient();
    const prompt = `Create a ${count} question multiple-choice exam for ${subject} at ${level} level. 
    Each question should have 4 options. 
    Provide the correct index (0-3). 
    Ensure the questions are educational and age-appropriate for K-8 students.`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: questionSchema,
        systemInstruction: "You are an expert teacher creating exams for elementary and middle school students."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(cleanJson(text)) as { questions: GeneratedQuestion[] };
    
    // Map to our Question interface
    return data.questions.map((q: GeneratedQuestion, index: number) => ({
      id: `ai-q-${Date.now()}-${index}`,
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation || "No explanation provided."
    }));

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    let errorMsg = "Failed to generate exam questions.";
    
    // Improved Error Messages
    if (error.message?.includes('Gemini API key missing')) {
        errorMsg = error.message;
    } else
    if (error.message?.includes('API key') || error.message?.includes('401')) {
        errorMsg = "API Key Error: Please check your configuration.";
    } else if (error.message?.includes('429') || error.message?.includes('quota')) {
        errorMsg = "System Busy: Usage limits exceeded. Please try again in a few minutes.";
    } else if (error.message?.includes('SAFETY')) {
        errorMsg = "Safety Block: The request content was flagged. Try a different topic.";
    } else if (error.message?.includes('500') || error.message?.includes('503')) {
        errorMsg = "Service Unavailable: Google Gemini is currently down. Try again later.";
    }

    throw new Error(errorMsg);
  }
};

export const checkContentSafety = async (content: string): Promise<{ safe: boolean; reason?: string }> => {
  try {
    if (!ai) {
        console.warn("Gemini API key missing. Skipping safety check.");
        return { safe: true };
    }
    const client = ensureClient();
    const prompt = `Analyze the following text for a K-12 school social platform. 
    Check for obscenity, bullying, hate speech, or inappropriate content. 
    Text: "${content}"`;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: safetySchema,
        systemInstruction: "You are a content moderator for a school application. Be strict about safety."
      }
    });
    
    const text = response.text;
    if (!text) return { safe: true }; 

    return JSON.parse(cleanJson(text)) as { safe: boolean; reason?: string };
  } catch (error) {
    console.error("Safety Check Error:", error);
    return { safe: true }; 
  }
};

export const getAnswerExplanation = async (
  questionText: string, 
  options: string[], 
  correctIndex: number, 
  studentAnswerIndex: number | null
): Promise<string> => {
  try {
    const client = ensureClient();
    const prompt = `Provide a short, kid-friendly explanation for this question. 
    Question: "${questionText}"
    Options: ${JSON.stringify(options)}
    Correct Answer: ${options[correctIndex]}
    ${studentAnswerIndex !== null ? `Student Answer: ${options[studentAnswerIndex]}` : 'Student did not answer.'}
    
    Explain why the correct answer is right and why the student's answer (if wrong) is incorrect.`;

    const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: explanationSchema,
            systemInstruction: "You are a helpful tutor explaining exam answers to a student."
        }
    });

    const text = response.text;
    if (!text) return "Unable to generate explanation.";
    const data = JSON.parse(cleanJson(text));
    return data.explanation;

  } catch (error) {
    console.error("Explanation Error:", error);
    return "Error generating explanation. Please try again later.";
  }
};

export const parseQuestionFromImage = async (base64Data: string): Promise<GeneratedQuestion | null> => {
    try {
        const client = ensureClient();
        const mimeType = base64Data.split(';')[0].split(':')[1];
        const data = base64Data.split(',')[1];

        const prompt = `Analyze this image. It contains a multiple-choice question.
        Extract the question text, the 4 options, and try to determine the correct answer if it's marked or obvious.
        If the correct answer is not marked, make a best guess or set it to 0.
        Also provide a short explanation.`;

        const response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                { text: prompt },
                { inlineData: { mimeType, data } }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: singleQuestionSchema,
                systemInstruction: "You are an optical character recognition AI optimized for exam questions."
            }
        });

        const text = response.text;
        if (!text) return null;
        return JSON.parse(cleanJson(text)) as GeneratedQuestion;

    } catch (error) {
        console.error("Image Parse Error:", error);
        return null;
    }
};
