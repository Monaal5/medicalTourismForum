import React from 'react';

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Careers at Medical Tourism Forum</h1>
          <div className="prose prose-lg text-gray-700">
            <p>
              Join our team and help shape the future of medical tourism information and community building.
            </p>
            <p className="mt-4">
              At Medical Tourism Forum, we're looking for passionate individuals who are committed to improving 
              healthcare accessibility and patient experiences worldwide.
            </p>
            
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Current Openings</h2>
            
            <div className="mt-6 space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900">Community Manager</h3>
                <p className="text-blue-600 font-medium mt-1">Full-time</p>
                <p className="mt-3">
                  We're seeking a Community Manager to foster engagement, moderate discussions, and support our growing 
                  community of healthcare professionals and patients.
                </p>
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900">Responsibilities:</h4>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Moderate community discussions and enforce guidelines</li>
                    <li>Engage with community members and respond to inquiries</li>
                    <li>Organize community events and educational initiatives</li>
                    <li>Identify and nurture key community contributors</li>
                  </ul>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900">Healthcare Content Specialist</h3>
                <p className="text-blue-600 font-medium mt-1">Full-time</p>
                <p className="mt-3">
                  Help us curate and create high-quality healthcare content for our community. This role involves 
                  researching medical topics, fact-checking information, and collaborating with healthcare professionals.
                </p>
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900">Responsibilities:</h4>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Research and write healthcare-related content</li>
                    <li>Collaborate with medical professionals for accuracy</li>
                    <li>Review and edit community-contributed content</li>
                    <li>Stay updated on medical tourism trends and developments</li>
                  </ul>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900">Frontend Developer</h3>
                <p className="text-blue-600 font-medium mt-1">Full-time</p>
                <p className="mt-3">
                  Join our engineering team to build and improve our platform. We're looking for developers with 
                  experience in modern web technologies to enhance user experience.
                </p>
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900">Requirements:</h4>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>Experience with React, Next.js, and TypeScript</li>
                    <li>Familiarity with modern CSS frameworks</li>
                    <li>Understanding of responsive design principles</li>
                    <li>Experience with accessibility standards</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-900">How to Apply</h3>
              <p className="mt-2">
                Please send your resume and a cover letter to{' '}
                <a href="mailto:careers@medicaltourismforum.com" className="text-blue-600 hover:underline">
                  careers@medicaltourismforum.com
                </a>{' '}
                with the subject line "Career Application - [Position Name]".
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}