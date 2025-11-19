// Results.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db, QUIZ_RESULTS_COLLECTION } from "../firebase/config";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function Results() {
  const { currentUser } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [resultToDelete, setResultToDelete] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentUser) {
      fetchResultsFromFirebase();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  // Results.js - Updated fetchResultsFromFirebase function
  const fetchResultsFromFirebase = async () => {
    if (!currentUser) {
      console.log("❌ No user logged in");
      setResults([]);
      setLoading(false);
      return;
    }

    // Check Firebase initialization
    if (!db) {
      console.error("❌ Firebase not initialized");
      setError("Database connection failed. Please refresh the page.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("📥 Fetching results for user:", currentUser.uid);

      const q = query(
        collection(db, QUIZ_RESULTS_COLLECTION),
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const firebaseResults = [];

      console.log(`📊 Found ${querySnapshot.size} documents`);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("📄 Document data:", data);

        firebaseResults.push({
          id: doc.id,
          ...data,
          timestamp:
            data.createdAt?.toDate?.()?.toISOString() ||
            data.timestamp ||
            new Date().toISOString(),
          quizTitle: data.quizTitle || "Unknown Quiz",
          score: data.score || 0,
          totalQuestions: data.totalQuestions || 0,
          percentage: data.percentage || 0,
          isCustom: data.isCustom || false,
        });
      });

      console.log("✅ Processed results:", firebaseResults);
      setResults(firebaseResults);

      // Update local storage
      localStorage.setItem("quizResults", JSON.stringify(firebaseResults));
    } catch (error) {
      console.error("❌ Error fetching results from Firebase:", error);

      if (error.code === "permission-denied") {
        setError("Permission denied. Please check Firebase rules.");
      } else if (error.code === "unavailable") {
        setError("Network error. Please check your connection.");
      } else {
        setError("Failed to load results: " + error.message);
      }

      // Fallback to local storage
      try {
        const localResults = JSON.parse(
          localStorage.getItem("quizResults") || "[]"
        );
        console.log(
          "🔄 Using local storage fallback:",
          localResults.length,
          "results"
        );
        setResults(localResults);
      } catch (localError) {
        console.error("❌ Local storage error:", localError);
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // 🚨 NEW: Delete result from Firebase
  const deleteResult = async (resultId) => {
    if (!currentUser) return;

    try {
      await deleteDoc(doc(db, QUIZ_RESULTS_COLLECTION, resultId));

      // Update local state
      const updatedResults = results.filter((result) => result.id !== resultId);
      setResults(updatedResults);

      // Update local storage
      localStorage.setItem("quizResults", JSON.stringify(updatedResults));

      setShowDeleteConfirm(false);
      setResultToDelete(null);

      console.log("✅ Result deleted from Firebase");
    } catch (error) {
      console.error("❌ Error deleting result from Firebase:", error);
      setError("Failed to delete result. Please try again.");
    }
  };

  // 🚨 NEW: Clear all user results from Firebase
  const clearAllResults = async () => {
    if (!currentUser) return;

    try {
      // Get all user results
      const q = query(
        collection(db, QUIZ_RESULTS_COLLECTION),
        where("userId", "==", currentUser.uid)
      );

      const querySnapshot = await getDocs(q);
      const deletePromises = [];

      querySnapshot.forEach((document) => {
        deletePromises.push(
          deleteDoc(doc(db, QUIZ_RESULTS_COLLECTION, document.id))
        );
      });

      await Promise.all(deletePromises);

      setResults([]);
      localStorage.removeItem("quizResults");
      setShowDeleteConfirm(false);
      setResultToDelete(null);

      console.log("✅ All results cleared from Firebase");
    } catch (error) {
      console.error("❌ Error clearing all results:", error);
      setError("Failed to clear all results. Please try again.");
    }
  };

  const openDeleteConfirm = (resultId) => {
    setResultToDelete(resultId);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setResultToDelete(null);
  };

  const openClearAllConfirm = () => {
    setResultToDelete("all");
    setShowDeleteConfirm(true);
  };

  const getQuizDisplayName = (result) => {
    if (result.isCustom) {
      return result.topic || result.quizTitle || "Custom Quiz";
    }

    const quizNames = {
      "js-basics": "JavaScript Basics",
      "react-advanced": "React Advanced",
    };

    return quizNames[result.quizId] || result.quizId.replace(/-/g, " ");
  };

  const getQuizTypeBadge = (result) => {
    if (result.isCustom) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          AI Generated
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Predefined
      </span>
    );
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    return "F";
  };

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">
          Please log in to view results
        </h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800">
            Loading Results...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Your Quiz Results
      </h1>
      <p className="text-gray-600 mb-8">Track your progress and performance</p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {results.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            No Results Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Take a quiz to see your results here!
          </p>
          <a
            href="/quizzes"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold inline-block"
          >
            Take a Quiz
          </a>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Showing {results.length} result{results.length !== 1 ? "s" : ""}
            </p>
            <div className="flex gap-3">
              <button
                onClick={fetchResultsFromFirebase}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={openClearAllConfirm}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Clear All Results
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {results.map((result, index) => (
              <div
                key={result.id}
                className="bg-white rounded-xl shadow-lg p-6 relative"
              >
                <button
                  onClick={() => openDeleteConfirm(result.id)}
                  className="absolute top-4 right-4 bg-white/80 hover:bg-red-50 text-red-500 hover:text-red-700 p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                  title="Delete this result"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 capitalize mb-1">
                      {getQuizDisplayName(result)}
                    </h3>
                    {getQuizTypeBadge(result)}
                  </div>
                  <span className="text-sm text-gray-500 mr-9">
                    {new Date(result.timestamp).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {result.score}
                    </div>
                    <div className="text-sm text-gray-600">Correct</div>
                  </div>

                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {result.totalQuestions}
                    </div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>

                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div
                      className={`text-2xl font-bold ${getGradeColor(
                        result.percentage
                      )}`}
                    >
                      {result.percentage}%
                    </div>
                    <div className="text-sm text-gray-600">Score</div>
                  </div>
                </div>

                {result.timeSpent && (
                  <div className="text-center mb-3">
                    <span className="text-sm text-gray-600">
                      Time spent: {Math.floor(result.timeSpent / 60)}:
                      {(result.timeSpent % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-700">
                    Grade:{" "}
                    <span className={getGradeColor(result.percentage)}>
                      {getGrade(result.percentage)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {resultToDelete === "all"
                ? "Clear All Results?"
                : "Delete Result?"}
            </h3>

            <p className="text-gray-600 mb-6">
              {resultToDelete === "all"
                ? "Are you sure you want to delete all your quiz results? This action cannot be undone."
                : "Are you sure you want to delete this quiz result? This action cannot be undone."}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeDeleteConfirm}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (resultToDelete === "all") {
                    clearAllResults();
                  } else {
                    deleteResult(resultToDelete);
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                {resultToDelete === "all" ? "Clear All" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
