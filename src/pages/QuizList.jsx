import React from 'react';
import { Link } from 'react-router-dom';

const quizzes = [
  {
    id: 'js-basics',
    title: "JavaScript Basics",
    description: "Test your JavaScript fundamentals with this beginner-friendly quiz",
    questions: 10,
    duration: "15 mins",
    difficulty: "Beginner",
    category: "Programming"
  },
  {
    id: 'react-advanced',
    title: "React Advanced",
    description: "Advanced React concepts and patterns for experienced developers",
    questions: 15,
    duration: "25 mins",
    difficulty: "Advanced",
    category: "Programming"
  },
  {
    id: 'css-mastery',
    title: "CSS Mastery",
    description: "CSS properties, layout techniques, and modern features",
    questions: 12,
    duration: "20 mins",
    difficulty: "Intermediate",
    category: "Web Design"
  },
  {
    id: 'general-knowledge',
    title: "General Knowledge",
    description: "Test your knowledge about various topics from around the world",
    questions: 20,
    duration: "30 mins",
    difficulty: "Intermediate",
    category: "General"
  }
];

export default function QuizList() {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Available Quizzes</h1>
      <p className="text-gray-600 mb-8">Choose a quiz to test your knowledge</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quizzes.map(quiz => (
          <div key={quiz.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition duration-300 border border-gray-100">
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-gray-800">{quiz.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                  {quiz.difficulty}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{quiz.description}</p>
              
              <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                <span>📝 {quiz.questions} questions</span>
                <span>⏱️ {quiz.duration}</span>
                <span>🏷️ {quiz.category}</span>
              </div>
              
              <Link
                to={`/quiz/${quiz.id}`}
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-4 rounded-lg font-semibold transition duration-200"
              >
                Start Quiz
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}