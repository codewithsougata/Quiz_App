import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const [imageError, setImageError] = useState(false);

  // Generate avatar URL based on user info
  const getAvatarUrl = () => {
    // If user has a photo URL and no error, use it
    if (currentUser?.photoURL && !imageError) {
      return currentUser.photoURL;
    }

    // Generate avatar with initials
    const name = currentUser?.displayName || currentUser?.email || "User";
    const encodedName = encodeURIComponent(name);
    return `https://ui-avatars.com/api/?name=${encodedName}&background=0D8ABC&color=fff&bold=true&size=128`;
  };

  // Get display name
  const getDisplayName = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName;
    }
    if (currentUser?.email) {
      return currentUser.email.split("@")[0]; // Use username part of email
    }
    return "User";
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="text-2xl left-1 relative font-bold text-blue-600 hover:text-blue-700 transition"
            >
              🎯QuizMaster
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={getAvatarUrl()}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-300"
                    onError={() => setImageError(true)}
                  />
                </div>
                <span className="text-gray-700 hidden md:block font-medium">
                  {getDisplayName()}
                </span>
                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200 text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-2"></div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
