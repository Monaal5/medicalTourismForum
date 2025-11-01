import React from 'react';

export default function GrievancePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Grievance Redressal</h1>
          <div className="prose prose-lg text-gray-700">
            <p>
              Medical Tourism Forum is committed to addressing user concerns and resolving grievances in a timely and fair manner.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Commitment</h2>
            <p>
              We strive to provide a safe, respectful, and informative platform for all users. If you have concerns about 
              content, user behavior, or platform functionality, our team is here to help.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How to File a Grievance</h2>
            <div className="mt-6 space-y-4">
              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Report Content or Behavior</h3>
                  <p className="mt-2">
                    Use the reporting tools available on posts, comments, or user profiles to flag inappropriate content.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Contact Support</h3>
                  <p className="mt-2">
                    For urgent matters or issues not resolved through reporting, contact our support team directly.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Formal Grievance</h3>
                  <p className="mt-2">
                    For formal grievances, submit a detailed description to our Grievance Officer using the contact information below.
                  </p>
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Grievance Officer</h2>
            <div className="border border-gray-200 rounded-lg p-6 mt-6">
              <p className="font-medium">Name: Grievance Redressal Officer</p>
              <p className="mt-2">Email: <a href="mailto:grievance@medicaltourismforum.com" className="text-blue-600 hover:underline">grievance@medicaltourismforum.com</a></p>
              <p className="mt-2">Phone: +1 (555) 123-4569</p>
              <p className="mt-2">Response Time: Within 48 hours for urgent matters, 5 business days for standard grievances</p>
            </div>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">What to Include in Your Grievance</h2>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Your contact information</li>
              <li>Detailed description of the issue</li>
              <li>Relevant dates and times</li>
              <li>Screenshots or evidence (if applicable)</li>
              <li>Any previous attempts to resolve the issue</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Appeals Process</h2>
            <p>
              If you are not satisfied with the resolution of your grievance, you may appeal to our Appeals Committee 
              within 14 days of receiving the initial response.
            </p>
            
            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-900">Note on Medical Advice</h3>
              <p className="mt-2">
                For concerns related to medical advice or treatment recommendations, please consult with qualified 
                healthcare professionals. Our platform is for informational purposes only and does not provide medical advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}