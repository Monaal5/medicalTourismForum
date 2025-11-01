import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <div className="prose prose-lg text-gray-700">
            <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Medical Tourism Forum platform, you agree to be bound by these Terms of Service 
              and all applicable laws and regulations.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
            <p>
              Medical Tourism Forum provides a platform for users to discuss healthcare topics, share experiences, 
              and connect with others in the medical tourism community.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. User Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate information when creating an account</li>
              <li>Respect other community members and their opinions</li>
              <li>Do not post false or misleading information</li>
              <li>Protect your account credentials and notify us of unauthorized access</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Prohibited Activities</h2>
            <p>Users may not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Post content that is illegal, harmful, or offensive</li>
              <li>Impersonate others or misrepresent your identity</li>
              <li>Harass, bully, or threaten other users</li>
              <li>Share personal health information of others without consent</li>
              <li>Attempt to gain unauthorized access to the platform</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Intellectual Property</h2>
            <p>
              All content on the Medical Tourism Forum, including text, graphics, logos, and software, is the property 
              of Medical Tourism Forum or its licensors and is protected by intellectual property laws.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Disclaimer of Medical Advice</h2>
            <p>
              The content on this platform is for informational purposes only and does not constitute medical advice. 
              Always consult with qualified healthcare professionals for medical concerns.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Limitation of Liability</h2>
            <p>
              Medical Tourism Forum shall not be liable for any direct, indirect, incidental, or consequential damages 
              arising from the use of this platform.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the platform after changes 
              constitutes acceptance of the revised terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}