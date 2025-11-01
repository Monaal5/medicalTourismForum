import React from 'react';

export default function AcceptableUsePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Acceptable Use Policy</h1>
          <div className="prose prose-lg text-gray-700">
            <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Purpose</h2>
            <p>
              This Acceptable Use Policy outlines the standards for using the Medical Tourism Forum platform. 
              By using our services, you agree to comply with these guidelines.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Prohibited Content</h2>
            <p>You may not post content that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Is illegal, harmful, or offensive</li>
              <li>Infringes on intellectual property rights</li>
              <li>Contains personal health information of others</li>
              <li>Promotes discrimination or harassment</li>
              <li>Spreads false medical information</li>
              <li>Advertises unauthorized medical services</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Prohibited Activities</h2>
            <p>You may not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Impersonate others or create fake accounts</li>
              <li>Harass, bully, or threaten other users</li>
              <li>Engage in spam or automated posting</li>
              <li>Attempt to gain unauthorized access to accounts</li>
              <li>Manipulate voting or engagement metrics</li>
              <li>Violate the privacy of other users</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Medical Information Standards</h2>
            <p>
              When sharing medical information, you must:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Clearly state that your experience is anecdotal</li>
              <li>Avoid making medical claims or recommendations</li>
              <li>Encourage others to consult healthcare professionals</li>
              <li>Not share unverified medical information</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Commercial Use</h2>
            <p>
              Commercial activities on the platform must comply with our guidelines:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Healthcare providers may share factual information about services</li>
              <li>Paid advertisements must be clearly labeled</li>
              <li>Endorsements must be disclosed</li>
              <li>Direct marketing to users is prohibited</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Enforcement</h2>
            <p>
              We reserve the right to remove content or suspend accounts that violate this policy. 
              Serious violations may result in permanent account termination.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Reporting Violations</h2>
            <p>
              If you encounter content or behavior that violates this policy, please report it to our moderation team 
              using the reporting tools available on the platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}