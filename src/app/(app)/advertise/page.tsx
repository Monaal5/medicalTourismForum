import React from 'react';

export default function AdvertisePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Advertise on Medical Tourism Forum</h1>
          <div className="prose prose-lg text-gray-700">
            <p>
              Reach healthcare professionals and medical tourism consumers through targeted advertising on our platform.
            </p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
                <h3 className="text-xl font-semibold text-blue-900">Targeted Audience</h3>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>Healthcare consumers planning medical travel</li>
                  <li>Medical professionals in the tourism sector</li>
                  <li>Insurance providers with international coverage</li>
                  <li>Travel agencies specializing in medical tourism</li>
                </ul>
              </div>
              
              <div className="border border-green-200 rounded-lg p-6 bg-green-50">
                <h3 className="text-xl font-semibold text-green-900">Advertising Options</h3>
                <ul className="list-disc pl-6 mt-4 space-y-2">
                  <li>Banner advertisements</li>
                  <li>Sponsored content</li>
                  <li>Featured provider listings</li>
                  <li>Newsletter sponsorships</li>
                </ul>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Why Advertise With Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">👥</span>
                </div>
                <h3 className="font-semibold text-gray-900">Targeted Reach</h3>
                <p className="text-gray-600 mt-2">Connect with an engaged audience actively seeking healthcare information</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">📊</span>
                </div>
                <h3 className="font-semibold text-gray-900">Measurable Results</h3>
                <p className="text-gray-600 mt-2">Track engagement and conversion metrics with our analytics dashboard</p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl">🏆</span>
                </div>
                <h3 className="font-semibold text-gray-900">Trusted Platform</h3>
                <p className="text-gray-600 mt-2">Associate your brand with a respected healthcare community</p>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get Started</h2>
              <p>
                Contact our advertising team to discuss your marketing goals and create a customized advertising strategy.
              </p>
              <div className="mt-4">
                <p className="font-medium">Email: <a href="mailto:advertise@medicaltourismforum.com" className="text-blue-600 hover:underline">advertise@medicaltourismforum.com</a></p>
                <p className="font-medium mt-2">Phone: +1 (555) 123-4567</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}