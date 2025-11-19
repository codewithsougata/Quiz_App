// firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyACwX05CXdeDD_XkHIvS7TLCnqKHWC1XW0",
  authDomain: "quiz-app-83846.firebaseapp.com",
  projectId: "quiz-app-83846",
  storageBucket: "quiz-app-83846.firebasestorage.app",
  messagingSenderId: "40500674368",
  appId: "1:40500674368:web:9845b6a47c2ecbe5a9c4a5",
  measurementId: "G-NY98DSKRTM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services with error handling
let auth, db;
try {
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

export { auth, db };
export const googleProvider = new GoogleAuthProvider();

// Firestore collections
export const QUIZ_RESULTS_COLLECTION = "quizResults";