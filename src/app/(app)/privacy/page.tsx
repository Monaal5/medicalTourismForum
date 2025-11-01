import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <div className="prose prose-lg text-gray-700">
            <p className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
            <p>We collect information you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information (name, email, username)</li>
              <li>User-generated content (questions, answers, posts)</li>
              <li>Communications with us (support requests, feedback)</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Personalize your experience on the platform</li>
              <li>Respond to your requests and inquiries</li>
              <li>Send you technical notices and updates</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Information Sharing</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>With service providers who assist in our operations</li>
              <li>When required by law or to protect our rights</li>
              <li>With your consent</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your information. However, no method of transmission 
              over the internet is 100% secure.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Object to processing of your personal data</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to enhance your experience and analyze platform usage.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Children's Privacy</h2>
            <p>
              Our platform is not intended for users under 18 years of age. We do not knowingly collect information 
              from children.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Changes to Privacy Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes by posting 
              the new policy on this page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}