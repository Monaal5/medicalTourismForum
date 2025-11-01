import React from 'react';

export default function PressPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Press & Media</h1>
          <div className="prose prose-lg text-gray-700">
            <p>
              Stay up to date with the latest news and announcements from Medical Tourism Forum.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Press Contacts</h2>
            <div className="border border-gray-200 rounded-lg p-6">
              <p className="font-medium">Media Inquiries:</p>
              <p>Email: <a href="mailto:press@medicaltourismforum.com" className="text-blue-600 hover:underline">press@medicaltourismforum.com</a></p>
              <p className="mt-2">Phone: +1 (555) 123-4568</p>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Press Releases</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900">Medical Tourism Forum Launches New Community Features</h3>
                <p className="text-gray-500 text-sm mt-1">June 15, 2025</p>
                <p className="mt-3">
                  New updates enhance user experience and provide better tools for healthcare discussions.
                </p>
                <button className="mt-4 text-blue-600 hover:underline font-medium">
                  Read full release
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900">Medical Tourism Forum Partners with International Healthcare Accreditation Association</h3>
                <p className="text-gray-500 text-sm mt-1">May 3, 2025</p>
                <p className="mt-3">
                  Partnership aims to improve quality standards and patient safety information.
                </p>
                <button className="mt-4 text-blue-600 hover:underline font-medium">
                  Read full release
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900">Medical Tourism Forum Reaches 100,000 Registered Users Milestone</h3>
                <p className="text-gray-500 text-sm mt-1">March 22, 2025</p>
                <p className="mt-3">
                  Platform continues to grow as a leading destination for medical tourism discussions.
                </p>
                <button className="mt-4 text-blue-600 hover:underline font-medium">
                  Read full release
                </button>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Media Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900">Company Logo</h3>
                <p className="text-gray-600 mt-2">High-resolution versions of our logo for editorial use.</p>
                <button className="mt-4 text-blue-600 hover:underline font-medium">
                  Download assets
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900">Executive Team Photos</h3>
                <p className="text-gray-600 mt-2">Professional headshots and biographies of our leadership team.</p>
                <button className="mt-4 text-blue-600 hover:underline font-medium">
                  Download assets
                </button>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Stay Connected</h2>
              <p>
                Follow us on social media for the latest updates and announcements.
              </p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-blue-600 hover:underline">Twitter</a>
                <a href="#" className="text-blue-600 hover:underline">LinkedIn</a>
                <a href="#" className="text-blue-600 hover:underline">Facebook</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}