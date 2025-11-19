import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });

export class GeminiService {
  static async generateQuiz(topic, difficulty = 'medium', numberOfQuestions = 5) {
    try {
      console.log('🚀 Starting Gemini quiz generation...', { topic, difficulty, numberOfQuestions });

      const prompt = this.createQuizPrompt(topic, difficulty, numberOfQuestions);
      
      console.log('📤 Sending prompt to Gemini...');
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = response.text;
      console.log('✅ Gemini response received');
      return this.parseAIResponse(text, topic, difficulty, numberOfQuestions);
      
    } catch (error) {
      console.error('❌ Gemini API Error:', error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  static createQuizPrompt(topic, difficulty, numberOfQuestions) {
    return `Create a ${difficulty} level multiple-choice quiz about "${topic}" with exactly ${numberOfQuestions} questions.

CRITICAL: You MUST respond with ONLY valid JSON format. No additional text, no explanations, no code blocks.

REQUIRED JSON STRUCTURE:
{
  "quiz": {
    "title": "Creative title about ${topic}",
    "description": "Engaging description for this ${difficulty} level quiz",
    "difficulty": "${difficulty}",
    "topic": "${topic}",
    "totalQuestions": ${numberOfQuestions},
    "questions": [
      {
        "id": 1,
        "question": "Clear, concise, and educational question here?",
        "options": [
          "Correct and accurate answer",
          "Plausible but incorrect option",
          "Clearly wrong option", 
          "Obviously incorrect option"
        ],
        "correctAnswer": 0,
        "explanation": "Brief educational explanation"
      }
    ]
  }
}

SPECIFIC REQUIREMENTS:
- Create exactly ${numberOfQuestions} high-quality questions
- Each question must have exactly 4 distinct options
- correctAnswer must be 0, 1, 2, or 3 (0 = first option)
- Questions should test real knowledge and be educational
- Make options plausible and educational
- Difficulty: ${difficulty} (adjust question complexity accordingly)
- All content must be about "${topic}"
- Return ONLY the JSON object, no other text

IMPORTANT: Ensure the JSON is valid and parsable.`;
  }

  static parseAIResponse(aiText, topic, difficulty, numberOfQuestions) {
    try {
      console.log('📝 Raw Gemini response:', aiText);

      if (!aiText) {
        throw new Error('No content received from Gemini AI');
      }

      // Clean the response - remove any non-JSON text
      let cleanedText = aiText.trim();
      
      // Remove markdown code blocks
      cleanedText = cleanedText.replace(/```json\s*/g, '');
      cleanedText = cleanedText.replace(/```\s*/g, '');
      
      // Extract JSON from response
      const jsonStart = cleanedText.indexOf('{');
      const jsonEnd = cleanedText.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No JSON object found in AI response');
      }
      
      cleanedText = cleanedText.substring(jsonStart, jsonEnd);
      console.log('🧹 Cleaned JSON:', cleanedText);

      const parsedData = JSON.parse(cleanedText);
      
      // Validate the structure
      if (this.validateQuizStructure(parsedData)) {
        console.log('🎯 Valid quiz structure received from Gemini!');
        return parsedData;
      } else {
        throw new Error('Quiz structure from AI is invalid');
      }
      
    } catch (error) {
      console.error('❌ Error parsing Gemini response:', error);
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }

  static validateQuizStructure(quizData) {
    try {
      if (!quizData || !quizData.quiz) {
        console.error('Missing quiz data');
        return false;
      }
      
      const { quiz } = quizData;
      
      const isValid = (
        quiz.title &&
        typeof quiz.title === 'string' &&
        quiz.description &&
        typeof quiz.description === 'string' &&
        quiz.difficulty &&
        quiz.topic &&
        Array.isArray(quiz.questions) &&
        quiz.questions.length > 0 &&
        quiz.questions.every(question => 
          question.id &&
          typeof question.question === 'string' &&
          question.question.length > 10 && // Reasonable question length
          Array.isArray(question.options) &&
          question.options.length === 4 &&
          question.options.every(opt => typeof opt === 'string' && opt.length > 0) &&
          typeof question.correctAnswer === 'number' &&
          question.correctAnswer >= 0 &&
          question.correctAnswer <= 3
        )
      );

      if (!isValid) {
        console.error('Quiz validation failed:', quiz);
      }
      
      return isValid;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  }

  static getErrorMessage(error) {
    if (error.message?.includes('API key not valid')) {
      return 'Invalid Gemini API key. Please check your API key in .env file.';
    } else if (error.message?.includes('Quota exceeded')) {
      return 'API quota exceeded. Please try again later or check your Google AI Studio quota.';
    } else if (error.message?.includes('Permission denied')) {
      return 'API permission denied. Please check your Google AI Studio settings.';
    } else if (error.message?.includes('Network Error')) {
      return 'Network error. Please check your internet connection.';
    } else {
      return error.message || 'Failed to generate quiz with Gemini AI. Please try again.';
    }
  }

  // Enhanced fallback mock data generator
  static generateMockQuiz(topic, difficulty, numberOfQuestions) {
    console.log('🔄 Using enhanced fallback mock data');
    
    const questionTemplates = {
      easy: [
        `What is the basic definition of ${topic}?`,
        `Which of these is a fundamental concept in ${topic}?`,
        `What is the primary purpose of ${topic}?`,
        `Who is considered a pioneer in ${topic}?`
      ],
      medium: [
        `How does ${topic} typically work?`,
        `What is a key principle in ${topic}?`,
        `Which approach is most effective for ${topic}?`,
        `What distinguishes ${topic} from similar concepts?`
      ],
      hard: [
        `What are the advanced applications of ${topic}?`,
        `How would you solve complex problems using ${topic}?`,
        `What are the limitations of ${topic}?`,
        `Which methodology is considered best practice in ${topic}?`
      ]
    };

    const templates = questionTemplates[difficulty] || questionTemplates.medium;
    
    const questions = Array.from({ length: numberOfQuestions }, (_, i) => {
      const template = templates[i % templates.length];
      return {
        id: i + 1,
        question: template,
        options: [
          `Accurate and comprehensive answer about ${topic}`,
          `Partially correct but incomplete information`,
          `Common misconception about ${topic}`,
          `Completely unrelated to ${topic}`
        ],
        correctAnswer: 0,
        explanation: `This is correct because it provides the most accurate information about ${topic}.`
      };
    });

    return {
      quiz: {
        title: `AI Generated Quiz: ${topic}`,
        description: `A ${difficulty} level quiz about ${topic} with ${numberOfQuestions} questions`,
        difficulty: difficulty,
        topic: topic,
        totalQuestions: numberOfQuestions,
        questions: questions,
        isMock: true,
        generatedAt: new Date().toISOString()
      }
    };
  }
}

// Check if API is configured
export const isApiConfigured = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  return apiKey && apiKey.startsWith('AIza') && apiKey.length > 30;
};

// Test API connection
export const testApiConnection = async () => {
  try {
    console.log('🧪 Testing Gemini API connection...');
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Say 'OK' if working.",
    });
    
    return { 
      success: true, 
      message: 'Gemini API is working!', 
      response: response.text 
    };
  } catch (error) {
    return { 
      success: false, 
      error: this.getErrorMessage(error) 
    };
  }
};

export default GeminiService;