import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Please log in to view profile</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Profile</h1>
      
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <img 
            src={currentUser.photoURL || '/default-avatar.png'} 
            alt="Profile" 
            className="w-32 h-32 rounded-full border-4 border-blue-100"
          />
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {currentUser.displayName || 'User'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <p className="text-lg text-gray-800">{currentUser.email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">User ID</label>
                <p className="text-sm text-gray-600 font-mono">{currentUser.uid}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Account Created</label>
                <p className="text-gray-800">
                  {currentUser.metadata?.creationTime ? 
                    new Date(currentUser.metadata.creationTime).toLocaleDateString() : 
                    'Unknown'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}