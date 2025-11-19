import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, googleProvider } from '../firebase/config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function register(email, password, displayName = '') {
    return createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Update profile with display name after registration
        if (displayName) {
          return updateProfile(userCredential.user, {
            displayName: displayName
          }).then(() => userCredential);
        }
        return userCredential;
      });
  }

  function loginWithGoogle() {
    return signInWithPopup(auth, googleProvider);
  }

  function logout() {
    return signOut(auth);
  }

  function updateUserProfile(profileData) {
    return updateProfile(auth.currentUser, profileData);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      console.log('Auth State - User:', user); // Debug log
      if (user) {
        console.log('User PhotoURL:', user.photoURL); // Debug log
        console.log('User DisplayName:', user.displayName); // Debug log
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}