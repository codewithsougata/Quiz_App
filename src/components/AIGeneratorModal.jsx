import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GeminiService, { isApiConfigured } from '../services/geminiApi';

export default function AIGeneratorModal({ onClose }) {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const generateQuiz = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let quizData;

      if (isApiConfigured()) {
        try {
          quizData = await GeminiService.generateQuiz(topic, difficulty, numberOfQuestions);
          console.log('✅ Generated quiz data:', quizData);
        } catch (apiError) {
          console.error('Gemini API failed:', apiError);
          quizData = GeminiService.generateMockQuiz(topic, difficulty, numberOfQuestions);
        }
      } else {
        quizData = GeminiService.generateMockQuiz(topic, difficulty, numberOfQuestions);
      }

      // 🚨 CRITICAL FIX: Create the EXACT format that QuizPlay expects
      const questions = quizData.quiz?.questions || quizData.questions || [];
      
      console.log('📊 Raw questions from API:', questions);

      // Transform questions to match QuizPlay format
      const transformedQuestions = questions.map((q, index) => ({
        id: q.id || index + 1,
        question: q.questionText || q.question || `Question ${index + 1} about ${topic}`,
        options: q.options || [],
        correctAnswer: q.correctAnswer ?? 0 // Default to first option if undefined
      }));

      console.log('🔄 Transformed questions:', transformedQuestions);

      // 🚨 SAVE IN THE CORRECT FLAT FORMAT (not nested)
      const quizToSave = {
        title: `AI Quiz: ${topic}`,
        description: `${difficulty} level quiz about ${topic}`,
        difficulty: difficulty,
        topic: topic,
        totalQuestions: transformedQuestions.length,
        questions: transformedQuestions,
        timestamp: new Date().toISOString(),
        type: 'ai-generated'
      };

      console.log('💾 Final quiz to save:', quizToSave);
      
      // Save to localStorage
      localStorage.setItem('customQuiz', JSON.stringify(quizToSave));
      localStorage.setItem('quizTopic', topic);
      localStorage.setItem('quizSource', 'ai-generator');
      
      console.log('✅ Data saved to localStorage');
      console.log('📝 localStorage customQuiz:', localStorage.getItem('customQuiz'));
      
      // Close modal and navigate
      onClose();
      
      setTimeout(() => {
        navigate('/quiz/custom');
      }, 100);
      
    } catch (error) {
      console.error('❌ Quiz generation failed:', error);
      setError('Failed to generate quiz. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">🤖 AI Quiz Generator</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              disabled={loading}
            >
              ×
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={generateQuiz} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Topic *
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Python, History, Science..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions
              </label>
              <select
                value={numberOfQuestions}
                onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={loading}
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg font-semibold transition duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-purple-300 disabled:to-pink-300 text-white py-3 px-4 rounded-lg font-semibold transition duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Generating...
                  </div>
                ) : (
                  'Generate Quiz'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}