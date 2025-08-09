import React from 'react';

const Quiz = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-tedx-black mb-4">
              Quiz
            </h1>
            <p className="text-xl text-gray-600">
              Test your knowledge about TED and TEDx
            </p>
          </div>

          {/* Quiz components will be implemented here */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-gray-600">Quiz functionalities will be implemented here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
