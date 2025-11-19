import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Import pages directly (no subfolder imports if files are in root pages folder)
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import QuizList from './pages/QuizList';
import QuizPlay from './pages/QuizPlay';
import Results from './pages/Results';
import Profile from './pages/Profile';
import FirebaseDebug from './pages/FirebaseDebug';

function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function AppContent() {
  const { currentUser } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {currentUser && <Sidebar />}
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Routes>
            <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!currentUser ? <Register /> : <Navigate to="/" />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/quizzes" element={<ProtectedRoute><QuizList /></ProtectedRoute>} />
            <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/quiz/:id" element={<ProtectedRoute><QuizPlay /></ProtectedRoute>} />
            <Route path="/quiz/custom" element={<ProtectedRoute><QuizPlay /></ProtectedRoute>} />
          </Routes>
          <FirebaseDebug />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;