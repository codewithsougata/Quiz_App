import React from 'react';

export default function DebugInfo() {
  const customQuiz = localStorage.getItem('customQuiz');
  const quizTopic = localStorage.getItem('quizTopic');
  
  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 p-4 rounded-lg text-xs max-w-md z-50">
      <h3 className="font-bold mb-2">🔧 Debug Info</h3>
      <p><strong>customQuiz in localStorage:</strong> {customQuiz ? '✅ Exists' : '❌ Missing'}</p>
      <p><strong>quizTopic:</strong> {quizTopic || 'Not set'}</p>
      {customQuiz && (
        <details>
          <summary>View Quiz Data</summary>
          <pre className="mt-2 whitespace-pre-wrap">{customQuiz}</pre>
        </details>
      )}
    </div>
  );
}