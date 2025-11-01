import React from 'react';

export default function AdChoicesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Ad Choices & Privacy</h1>
          <div className="prose prose-lg text-gray-700">
            <p>
              Learn about how we use data for advertising and how you can control your ad experience on Medical Tourism Forum.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How We Use Data for Advertising</h2>
            <p>
              We use information to provide relevant advertising, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Your general location (city/country level)</li>
              <li>Your interests based on your activity on our platform</li>
              <li>The types of content you engage with</li>
              <li>Your device type and browser information</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Your Ad Choices</h2>
            <div className="mt-6 space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900">Opt Out of Interest-Based Ads</h3>
                <p className="mt-3">
                  You can opt out of personalized advertising by adjusting your preferences in your account settings.
                </p>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Manage Ad Preferences
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900">Limit Ad Tracking on Mobile</h3>
                <p className="mt-3">
                  You can limit ad tracking through your device settings:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>iOS: Settings {'>'} Privacy & Security {'>'} Apple Advertising {'>'} Personalized Ads</li>
                  <li>Android: Settings {'>'} Google {'>'} Ads {'>'} Opt out of Ads Personalization</li>
                </ul>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900">Browser-Based Controls</h3>
                <p className="mt-3">
                  You can use browser extensions and settings to limit tracking:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-3">
                  <li>Enable "Do Not Track" in your browser settings</li>
                  <li>Install privacy-focused browser extensions</li>
                  <li>Regularly clear your browser cookies</li>
                </ul>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Third-Party Advertisers</h2>
            <p>
              We work with third-party advertising partners who may collect information about your online activities 
              across different websites and services. These partners may include:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Google AdSense</li>
              <li>Facebook Audience Network</li>
              <li>Other programmatic advertising platforms</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Us</h2>
            <p>
              If you have questions about our advertising practices or ad preferences, please contact us at:
            </p>
            <p className="mt-2">
              Email: <a href="mailto:privacy@medicaltourismforum.com" className="text-blue-600 hover:underline">privacy@medicaltourismforum.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}