// QuizPlay.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db, QUIZ_RESULTS_COLLECTION } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Predefined quizzes (same as before)
const predefinedQuizzes = {
  "js-basics": [
    {
      id: 1,
      question: "What is JavaScript?",
      options: ["Programming language", "Coffee", "Car", "Movie"],
      correctAnswer: 0,
    },
    {
      id: 2,
      question: "Who made JavaScript?",
      options: ["Microsoft", "Netscape", "Google", "Apple"],
      correctAnswer: 1,
    },
  ],
  "react-advanced": [
    {
      id: 1,
      question: "What is React?",
      options: ["JS Library", "Language", "Database", "OS"],
      correctAnswer: 0,
    },
  ],
};

export default function QuizPlay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    console.log("🔄 QuizPlay loading with ID:", id);
    console.log("📍 Current path:", location.pathname);

    const loadQuiz = () => {
      setLoading(true);

      const isCustomQuiz =
        id === "custom" || location.pathname === "/quiz/custom";

      console.log("🎯 Is custom quiz?", isCustomQuiz);

      if (isCustomQuiz) {
        const customQuizJSON = localStorage.getItem("customQuiz");
        const topic = localStorage.getItem("quizTopic");

        console.log("📦 Custom quiz from storage:", customQuizJSON);

        if (customQuizJSON) {
          try {
            const quizData = JSON.parse(customQuizJSON);
            console.log("✅ Parsed quiz data:", quizData);

            if (quizData.questions && Array.isArray(quizData.questions)) {
              setQuestions(quizData.questions);
              setQuizTitle(quizData.title || `AI Quiz: ${topic}`);
              console.log(
                "✅ Success! Loaded",
                quizData.questions.length,
                "questions"
              );
            } else {
              console.error("❌ No questions array found in quiz data");
              setQuestions([]);
            }
          } catch (error) {
            console.error("❌ Parse error:", error);
            setQuestions([]);
          }
        } else {
          console.error("❌ No custom quiz data found in localStorage");
          setQuestions([]);
        }
      } else {
        const predefined = predefinedQuizzes[id] || [];
        console.log("📚 Loading predefined quiz:", id, predefined);
        setQuestions(predefined);
        setQuizTitle(getPredefinedTitle(id));
      }

      setLoading(false);
    };

    loadQuiz();
  }, [id, location.pathname]);

  const getPredefinedTitle = (quizId) => {
    const titles = {
      "js-basics": "JavaScript Basics",
      "react-advanced": "React Advanced",
    };
    return titles[quizId] || "Quiz";
  };

  // Timer effect (same as before)
  useEffect(() => {
    if (questions.length > 0 && timeLeft > 0 && !showResult && !loading) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && questions.length > 0 && !loading) {
      handleFinish();
    }
  }, [timeLeft, showResult, questions.length, loading]);

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === questions[currentQuestion]?.correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      handleFinish();
    }
  };

  // QuizPlay.js - Updated saveResultToFirebase function
  const saveResultToFirebase = async (result) => {
    if (!currentUser) {
      console.error("❌ No user logged in");
      return null;
    }

    // Validate Firebase connection
    if (!db) {
      console.error("❌ Firebase not initialized");
      return null;
    }

    try {
      setSaving(true);

      // Validate required fields
      if (!result.quizId || !result.quizTitle || result.score === undefined) {
        console.error("❌ Missing required result fields:", result);
        return null;
      }

      const resultData = {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        quizId: result.quizId,
        quizTitle: result.quizTitle,
        score: result.score,
        totalQuestions: result.totalQuestions,
        percentage: result.percentage,
        isCustom: result.isCustom || false,
        timeSpent: 300 - timeLeft,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
        // Include topic for custom quizzes
        ...(result.isCustom && result.topic && { topic: result.topic }),
      };

      console.log("📤 Saving to Firebase:", resultData);

      const docRef = await addDoc(
        collection(db, QUIZ_RESULTS_COLLECTION),
        resultData
      );
      console.log("✅ Result saved to Firebase with ID:", docRef.id);

      return docRef.id;
    } catch (error) {
      console.error("❌ Error saving result to Firebase:", error);

      // More detailed error logging
      if (error.code) {
        console.error("Firebase error code:", error.code);
        console.error("Firebase error message:", error.message);
      }

      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = async () => {
    const finalScore =
      selectedAnswer === questions[currentQuestion]?.correctAnswer
        ? score + 1
        : score;
    const percentage = Math.round((finalScore / questions.length) * 100);

    const isCustom = id === "custom" || location.pathname === "/quiz/custom";

    const result = {
      quizId: id || "custom",
      quizTitle: isCustom ? quizTitle : getPredefinedTitle(id),
      score: finalScore,
      totalQuestions: questions.length,
      percentage: percentage,
      timestamp: new Date().toISOString(),
      isCustom: isCustom,
      timeLeft: timeLeft,
      // Add topic for custom quizzes
      ...(isCustom && { topic: localStorage.getItem("quizTopic") }),
    };

    // Save to Firebase
    const firebaseId = await saveResultToFirebase(result);

    // Also save locally for immediate access (optional)
    const existingResults = JSON.parse(
      localStorage.getItem("quizResults") || "[]"
    );
    const localResult = {
      ...result,
      firebaseId: firebaseId, // Store Firebase ID for reference
    };
    existingResults.push(localResult);
    localStorage.setItem("quizResults", JSON.stringify(existingResults));

    setShowResult(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const question = questions[currentQuestion];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800">Loading Quiz...</h2>
          <p className="text-gray-600 mt-2">ID: {id || "custom"}</p>
        </div>
      </div>
    );
  }

  if (!questions.length && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Quiz Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The quiz could not be loaded or has no questions.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (showResult) {
    const finalScore =
      selectedAnswer === questions[currentQuestion]?.correctAnswer
        ? score + 1
        : score;
    const percentage = Math.round((finalScore / questions.length) * 100);

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Quiz Completed!
          </h2>
          {saving && (
            <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-lg">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Saving your results...
              </div>
            </div>
          )}
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {finalScore}/{questions.length}
          </div>
          <div className="text-2xl font-semibold text-gray-600 mb-6">
            {percentage}%
          </div>
          <button
            onClick={() => navigate("/results")}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold mr-3"
          >
            View All Results
          </button>
          <button
            onClick={() => navigate("/")}
            className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{quizTitle}</h2>
              <p className="text-gray-600">
                Question {currentQuestion + 1} of {questions.length}
              </p>
              <p className="text-sm text-gray-500">Quiz ID: {id || "custom"}</p>
            </div>
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-semibold">
              ⏱️ {formatTime(timeLeft)}
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 mb-8">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              }}
            ></div>
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              {question?.question}
            </h3>
            <div className="space-y-3">
              {question?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition duration-200 text-lg ${
                    selectedAnswer === index
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() =>
                currentQuestion > 0 && setCurrentQuestion(currentQuestion - 1)
              }
              disabled={currentQuestion === 0}
              className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={selectedAnswer === null}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-8 py-3 rounded-lg font-semibold"
            >
              {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
