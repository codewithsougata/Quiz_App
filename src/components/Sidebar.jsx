import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AIGeneratorModal from './AIGeneratorModal';

export default function Sidebar() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [showAIModal, setShowAIModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // SCROLL TOGGLE BUTTON
  const [showScrollToggle, setShowScrollToggle] = useState(false);
  const hideTimeoutRef = useRef(null);

  if (!currentUser) return null;

  // Scroll detection for Option A
  useEffect(() => {
    const handleScroll = () => {
      // Show toggle button
      setShowScrollToggle(true);

      // Reset previous timer
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

      // Hide button after scroll stop
      hideTimeoutRef.current = setTimeout(() => {
        setShowScrollToggle(false);
      }, 1500);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  // Device detection
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const menuItems = [
    { path: '/', label: 'Home', icon: '🏠', gradient: 'from-blue-500 to-blue-600' },
    { path: '/quizzes', label: 'Quizzes', icon: '📝', gradient: 'from-green-500 to-green-600' },
    { path: '/results', label: 'Results', icon: '📊', gradient: 'from-purple-500 to-purple-600' },
    { path: '/profile', label: 'Profile', icon: '👤', gradient: 'from-pink-500 to-pink-600' },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLinkClick = () => {
    if (isMobile) closeSidebar();
  };

  const handleAIClick = () => {
    setShowAIModal(true);
    if (isMobile) closeSidebar();
  };

  return (
    <>
      {/* 🌟 SCROLL-BASED TOGGLE BUTTON (Option A) */}
      {showScrollToggle && !isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="
            fixed top-4 left-4 
            z-[9999] p-3 
            bg-gradient-to-br from-blue-600 to-purple-600 
            text-white rounded-xl shadow-lg 
            animate-slide-in-left
            lg:hidden
          "
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Transparent Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-10 z-30 lg:hidden" onClick={closeSidebar} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:relative bg-white shadow-2xl z-40 border-r border-gray-200
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-72 sm:w-80 lg:w-64 xl:w-72 min-h-screen flex flex-col`}
      >

        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎯</span>
            <h2 className="text-xl font-bold">QuizMaster</h2>
          </div>

          <button onClick={closeSidebar} className="lg:hidden p-2 text-white/90 hover:bg-white/20 rounded-lg">
            ✖
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 m-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
            {currentUser.email?.charAt(0).toUpperCase()}
          </div>

          <div>
            <p className="font-semibold text-gray-800">{currentUser.displayName || currentUser.email}</p>
            <p className="text-xs text-gray-500">Premium Member</p>
          </div>
        </div>

        {/* MENU */}
        <nav className="flex-1 px-3 overflow-y-auto">
          <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Menu</p>

          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={`
                group flex items-center px-4 py-3 my-1 rounded-xl transition-all
                ${
                  location.pathname === item.path
                    ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg scale-105`
                    : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <span className="text-2xl mr-4">{item.icon}</span>
              <span className="font-semibold">{item.label}</span>
            </Link>
          ))}

          {/* AI Button */}
          <div className="mt-6 px-3">
            <button
              onClick={handleAIClick}
              className="w-full px-4 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white
              rounded-xl shadow-lg hover:scale-105 transition-all font-bold"
            >
              🤖 AI Generate Quiz
            </button>
          </div>
        </nav>

      </div>

      {/* AI Modal */}
      {showAIModal && <AIGeneratorModal onClose={() => setShowAIModal(false)} />}
    </>
  );
}
