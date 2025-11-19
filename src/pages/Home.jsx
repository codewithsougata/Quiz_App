import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AIGeneratorModal from '../components/AIGeneratorModal';

export default function Home() {
  const { currentUser } = useAuth();
  const [showAIModal, setShowAIModal] = useState(false);

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to access quizzes</h2>
        <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
          Get Started
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow max-w-6xl mx-auto px-4 py-8">
        {/* AI Generate Section */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Create Custom Quizzes with AI! 🤖
            </h1>
            <p className="text-xl mb-6 opacity-90">
              Generate personalized quizzes on any topic using AI
            </p>
            <button
              onClick={() => setShowAIModal(true)}
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition duration-200"
            >
              🚀 Generate AI Quiz Now
            </button>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to QuizMaster, {currentUser.displayName || currentUser.email}!
          </h2>
          <p className="text-xl text-gray-600">Test your knowledge with our interactive quizzes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-2">Multiple Categories</h3>
            <p className="text-gray-600">Choose from various topics and difficulty levels</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="text-4xl mb-4">⏱️</div>
            <h3 className="text-xl font-bold mb-2">Timed Quizzes</h3>
            <p className="text-gray-600">Challenge yourself with timed questions</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Track Progress</h3>
            <p className="text-gray-600">Monitor your results and improve over time</p>
          </div>
        </div>

        <div className="text-center">
          <Link 
            to="/quizzes" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition duration-200"
          >
            Browse All Quizzes 📝
          </Link>
        </div>

        {/* AI Generator Modal */}
        {showAIModal && (
          <AIGeneratorModal onClose={() => setShowAIModal(false)} />
        )}
      </div>

      {/* Footer Section */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* App Information */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">QuizMaster 🎯</h3>
              <p className="text-gray-300 mb-4">
                QuizMaster is an interactive quiz platform that helps you test and improve your knowledge 
                across various subjects. With AI-powered quiz generation, timed challenges, and progress 
                tracking, learning has never been more engaging!
              </p>
              <div className="flex space-x-4">
                <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">AI Powered</span>
                <span className="bg-green-600 px-3 py-1 rounded-full text-sm">Interactive</span>
                <span className="bg-purple-600 px-3 py-1 rounded-full text-sm">Educational</span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-gray-300 hover:text-white transition duration-200">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/quizzes" className="text-gray-300 hover:text-white transition duration-200">
                    Browse Quizzes
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="text-gray-300 hover:text-white transition duration-200">
                    Help & Support
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-300 hover:text-white transition duration-200">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Developer Information */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Developer Info</h4>
              <div className="text-gray-300">
                <p className="mb-2">Developed with ❤️ by</p>
                <p className="font-medium mb-1">QuizMaster Team</p>
                <p className="text-sm mb-3">Passionate about creating engaging learning experiences</p>
                
                <div className="space-y-1 text-sm">
                  <p>📧 support@quizmaster.com</p>
                  <p>🌐 www.quizmaster.com</p>
                  <p>📱 Version 1.0.0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Services Section */}
          <div className="border-t border-gray-700 mt-8 pt-8">
            <h4 className="text-lg font-semibold mb-4 text-center">Our Services</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl mb-2">🎓</div>
                <h5 className="font-semibold mb-2">Educational Quizzes</h5>
                <p className="text-sm text-gray-300">Comprehensive quizzes for students and learners</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl mb-2">🤖</div>
                <h5 className="font-semibold mb-2">AI Generation</h5>
                <p className="text-sm text-gray-300">Custom quizzes generated by advanced AI</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <div className="text-2xl mb-2">📈</div>
                <h5 className="font-semibold mb-2">Progress Analytics</h5>
                <p className="text-sm text-gray-300">Track your learning journey with detailed insights</p>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-700 mt-8 pt-6 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} QuizMaster. All rights reserved. | 
              Made with React & Tailwind CSS
            </p>
            <p className="text-gray-400">
              Privacy Policy | Terms of Serviceteh | Contact Us 
            </p>
            <p className="text-gray-400">
              The New Version is Coming Soon! Stay Tuned..........
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}