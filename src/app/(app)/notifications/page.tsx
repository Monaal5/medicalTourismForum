import React from 'react';

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Notifications</h1>
          <div className="prose prose-lg text-gray-700">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔔</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-500 mb-4">
                When people interact with your questions, answers, or posts, you'll see notifications here.
              </p>
              <div className="flex justify-center">
                <a 
                  href="/" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Explore the community
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}