import React from 'react';

export default function StatsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Content & Stats</h1>
          <div className="prose prose-lg text-gray-700">
            <p>
              Track your contributions and engagement on the Medical Tourism Forum.
            </p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-blue-600">0</div>
                <div className="text-gray-700 mt-2">Questions Asked</div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-600">0</div>
                <div className="text-gray-700 mt-2">Answers Provided</div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-purple-600">0</div>
                <div className="text-gray-700 mt-2">Posts Created</div>
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="border border-gray-200 rounded-lg p-6 text-center">
                <p className="text-gray-500">No activity yet. Start participating in the community!</p>
                <div className="mt-4">
                  <a 
                    href="/ask" 
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Ask a Question
                  </a>
                  <a 
                    href="/create-post" 
                    className="inline-flex items-center px-4 py-2 ml-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Create a Post
                  </a>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Achievements</h2>
              <div className="border border-gray-200 rounded-lg p-6 text-center">
                <p className="text-gray-500">Earn achievements by participating in the community</p>
                <div className="flex justify-center mt-4 space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👍</span>
                  </div>
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💬</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}