import React from 'react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">About Medical Tourism Forum</h1>
          <div className="prose prose-lg text-gray-700">
            <p>
              Welcome to the Medical Tourism Forum, a community platform dedicated to connecting patients, healthcare providers, 
              and industry professionals in the medical tourism sector.
            </p>
            <p className="mt-4">
              Our mission is to provide a trusted space where individuals can share experiences, ask questions, and find reliable 
              information about healthcare options around the world.
            </p>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Vision</h2>
            <p>
              We envision a world where access to quality healthcare is not limited by geography, and where patients can make 
              informed decisions about their medical care with confidence.
            </p>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Community Guidelines</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Respect all community members</li>
              <li>Share accurate and helpful information</li>
              <li>Protect patient privacy and confidentiality</li>
              <li>Report inappropriate content</li>
              <li>Engage constructively in discussions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}