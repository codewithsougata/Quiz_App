// FirebaseDebug.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';

export default function FirebaseDebug() {
  const { currentUser } = useAuth();
  
  const checkFirebase = () => {
    console.log('🔍 Firebase Debug Info:');
    console.log('Firebase db instance:', db);
    console.log('Current user:', currentUser);
    console.log('User UID:', currentUser?.uid);
    
    // Check if we can access collections
    if (db) {
      console.log('✅ Firebase is initialized');
    } else {
      console.log('❌ Firebase NOT initialized');
    }
  };  
}