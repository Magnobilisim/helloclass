
import { GoogleGenAI, Type } from "@google/genai";
import { GradeLevel, Language, Question } from "../types";

// NOTE: In a real production app, this key should be proxied through a backend.
const API_KEY = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateQuizQuestions = async (
  topic: string,
  subTopic: string,
  questionCount: number,
  gradeLevelEnum: GradeLevel,
  specificClass: number, 
  language: Language
): Promise<Question[]> => {
  
  const langText = language === 'TR' ? 'Turkish' : 'English';
  const count = questionCount || 5;

  if (!API_KEY) {
    console.warn("API Key is missing. Returning mock data.");
    return getMockQuestions(language).slice(0, count);
  }

  const prompt = `
    Generate ${count} multiple-choice questions about "${topic}".
    Specific Focus/Sub-topic: "${subTopic}".
    
    Context:
    - If the topic implies a school grade (e.g. "3. Sınıf", "Grade 5"), target that specific age group.
    - If the topic is professional/exam based (e.g. "TOEFL", "Driver License", "ISG"), target adults/students preparing for that exam.
    
    Language: ${langText}.
    Difficulty: Adaptive to the topic.
    Return the response in strict JSON format.
    
    JSON Schema:
    [
      {
        "id": "string",
        "text": "string",
        "options": ["string", "string", "string", "string"],
        "correctIndex": integer (0-3),
        "explanation": "string"
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ["id", "text", "options", "correctIndex"]
          }
        }
      }
    });

    if (response.text) {
        let cleanText = response.text.trim();
        if (cleanText.startsWith('```')) {
            cleanText = cleanText.replace(/^```(json)?|```$/g, '').trim();
        }
        return JSON.parse(cleanText) as Question[];
    }
    throw new Error("Empty response");

  } catch (error) {
    console.error("Gemini generation failed, using mock:", error);
    return getMockQuestions(language).slice(0, count);
  }
};

export const explainAnswer = async (
    questionText: string, 
    correctAnswerText: string, 
    language: Language
): Promise<string> => {
    if (!API_KEY) return "AI Key missing. Default explanation.";

    const prompt = `
      Explain simply why the answer to the question "${questionText}" is "${correctAnswerText}".
      Language: ${language === 'TR' ? 'Turkish' : 'English'}.
      Tone: Educational, encouraging, like a teacher explaining to a student.
      Max length: 2 sentences.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text || "Explanation not available.";
    } catch (e) {
        return "Explanation unavailable.";
    }
}

export const checkContentSafety = async (text: string): Promise<boolean> => {
    // If no API key, perform basic keyword check (expanded for testing)
    if (!API_KEY) {
        const badWords = [
            'badword', 'hate', 'nsfw', 'aptal', 'gerizekalı', 'salak', 'mal', 
            'manyak', 'küfür', 'xxx', 'adult', 'seks', 'bomba', 'öldür', 
            'silah', 'uyuşturucu', 'bet', 'kumar'
        ];
        const found = badWords.some(word => text.toLowerCase().includes(word));
        return !found;
    }

    const prompt = `
        Analyze the following social media post text for obscenity, hate speech, sexual content, or harassment.
        Text: "${text}"
        
        Respond strictly with "SAFE" if it is appropriate for a school environment.
        Respond strictly with "UNSAFE" if it contains inappropriate content.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        const result = response.text?.trim().toUpperCase();
        return result === 'SAFE';
    } catch (e) {
        console.error("Safety check failed", e);
        return true; // Fail open (allow) or closed (block) depending on policy. Here we fail open for demo UX.
    }
};

const getMockQuestions = (lang: Language): Question[] => [
  {
    id: '1',
    text: lang === 'TR' ? 'Bu konu hakkında detaylı bilgi bulunamadı, ancak genel kültür sorusu: Türkiye\'nin başkenti neresidir?' : 'Detailed info not found, general question: What is the capital of Turkey?',
    options: ['İstanbul', 'Ankara', 'İzmir', 'Bursa'],
    correctIndex: 1,
    explanation: 'Ankara is the capital city.'
  },
  {
    id: '2',
    text: lang === 'TR' ? '2 + 2 kaç eder?' : 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    correctIndex: 1,
    explanation: 'Basic arithmetic.'
  },
  {
    id: '3',
    text: lang === 'TR' ? 'Hangi gezegen "Kızıl Gezegen" olarak bilinir?' : 'Which planet is known as the Red Planet?',
    options: ['Mars', 'Venus', 'Jupiter', 'Saturn'],
    correctIndex: 0,
    explanation: 'Mars appears red due to iron oxide.'
  },
  {
      id: '4',
      text: lang === 'TR' ? 'Su kaç derecede kaynar (deniz seviyesinde)?' : 'At what temperature does water boil?',
      options: ['90°C', '100°C', '110°C', '120°C'],
      correctIndex: 1,
      explanation: 'Water boils at 100 degrees Celsius.'
  },
  {
      id: '5',
      text: lang === 'TR' ? 'Türkiye Cumhuriyeti kaç yılında kuruldu?' : 'When was the Turkish Republic founded?',
      options: ['1920', '1923', '1919', '1938'],
      correctIndex: 1,
      explanation: '1923.'
  }
];
