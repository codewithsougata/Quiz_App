import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AIGeneratorModal from './AIGeneratorModal';

export default function Sidebar() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [showAIModal, setShowAIModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  if (!currentUser) return null;

  // Detect mobile devices and handle resize
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    // Close sidebar when route changes on mobile
    if (isMobile && isSidebarOpen) {
      const handleRouteChange = () => setIsSidebarOpen(false);
      window.addEventListener('popstate', handleRouteChange);
      return () => window.removeEventListener('popstate', handleRouteChange);
    }

    return () => window.removeEventListener('resize', checkDevice);
  }, [isMobile, isSidebarOpen]);

  const menuItems = [
    { path: '/', label: 'Home', icon: '🏠', gradient: 'from-blue-500 to-blue-600' },
    { path: '/quizzes', label: 'Quizzes', icon: '📝', gradient: 'from-green-500 to-green-600' },
    { path: '/results', label: 'Results', icon: '📊', gradient: 'from-purple-500 to-purple-600' },
    { path: '/profile', label: 'Profile', icon: '👤', gradient: 'from-pink-500 to-pink-600' },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleLinkClick = () => {
    if (isMobile) {
      closeSidebar();
    }
  };

  const handleAIClick = () => {
    setShowAIModal(true);
    if (isMobile) {
      closeSidebar();
    }
  };

  return (
    <>
      {/* Modern Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-3 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-300 lg:hidden backdrop-blur-sm"
        aria-label="Toggle menu"
      >
        <div className="w-6 h-6 flex items-center justify-center">
          {isSidebarOpen ? (
            <svg className="w-6 h-6 rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : ( 
            <svg className="w-6 h-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </div>
      </button>

      {/* Enhanced Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-300"
          onClick={closeSidebar}
          onTouchStart={closeSidebar}
        />
      )}

      {/* Modern Sidebar */}
      <div 
        className={`
          fixed lg:relative 
          bg-gradient-to-b from-white via-gray-50 to-white
          shadow-2xl lg:shadow-xl 
          min-h-screen lg:min-h-full 
          z-40 
          transition-all duration-300 ease-in-out 
          flex flex-col
          border-r border-gray-200
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-72 sm:w-80 lg:w-64 xl:w-72
          max-w-[85vw] lg:max-w-none
        `}
      >
        {/* Gradient Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            <h2 className="text-xl font-bold text-white">QuizMaster</h2>
          </div>
          <button
            onClick={closeSidebar}
            className="lg:hidden p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200 text-white"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Profile Card */}
        <div className="p-4 m-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-sm border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md">
              {currentUser.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Premium Member</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 mt-2 px-3 overflow-y-auto">
          <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Menu</p>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={`
                group flex items-center px-4 py-3.5 my-1 rounded-xl
                transition-all duration-300
                ${location.pathname === item.path 
                  ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg scale-105` 
                  : 'text-gray-700 hover:bg-gray-100 hover:scale-102'
                }
              `}
            >
              <span className={`text-2xl mr-4 transition-transform duration-300 ${
                location.pathname === item.path ? 'scale-110' : 'group-hover:scale-110'
              }`}>
                {item.icon}
              </span>
              <span className="font-semibold text-base flex-1">{item.label}</span>
              {location.pathname === item.path && (
                <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </Link>
          ))}
          
          {/* AI Generate Quiz Button */}
          <div className="mt-6 px-3">
            <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Tools</p>
            <button
              onClick={handleAIClick}
              className="
                w-full group relative overflow-hidden
                flex items-center justify-center
                px-4 py-4
                bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600
                hover:from-pink-600 hover:via-purple-600 hover:to-pink-600
                text-white 
                rounded-xl
                shadow-lg hover:shadow-2xl
                transition-all duration-300
                hover:scale-105
                font-bold text-base
              "
            >
              <span className="text-2xl mr-3 group-hover:animate-bounce">🤖</span>
              <span className="flex-1 text-left">AI Generate Quiz</span>
              <span className="text-xl group-hover:rotate-12 transition-transform duration-300">✨</span>
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="font-semibold">v1.0.0</span>
              <span className="text-gray-300">•</span>
              <span>QuizMaster</span>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 group">
              <span className="text-lg group-hover:rotate-90 transition-transform duration-300 inline-block">⚙️</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Generator Modal */}
      {showAIModal && (
        <AIGeneratorModal onClose={() => setShowAIModal(false)} />
      )}
    </>
  );
}