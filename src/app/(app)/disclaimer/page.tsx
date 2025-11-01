export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Medical Disclaimer</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 font-medium">
                ⚠️ Important: The information on this forum is for educational and informational purposes only and is not intended as medical advice.
              </p>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">No Medical Advice</h2>
            <p className="text-gray-700 mb-4">
              The content on this Medical Tourism Forum is provided for general informational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">User-Generated Content</h2>
            <p className="text-gray-700 mb-4">
              The information shared by users on this forum represents their personal experiences and opinions. This content has not been verified by medical professionals and should not be considered as medical advice.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Medical Tourism Risks</h2>
            <p className="text-gray-700 mb-4">
              Medical tourism involves traveling to another country for medical treatment. This carries inherent risks including:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
              <li>Differences in medical standards and regulations</li>
              <li>Language barriers</li>
              <li>Limited follow-up care</li>
              <li>Legal and insurance complications</li>
              <li>Quality and safety concerns</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Professional Medical Care</h2>
            <p className="text-gray-700 mb-4">
              We strongly recommend that you:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
              <li>Consult with qualified healthcare professionals before making any medical decisions</li>
              <li>Research healthcare providers thoroughly</li>
              <li>Verify credentials and certifications</li>
              <li>Understand the risks and benefits of any treatment</li>
              <li>Consider your local healthcare options first</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Emergency Situations</h2>
            <p className="text-gray-700 mb-4">
              In case of a medical emergency, contact your local emergency services immediately. Do not rely on information from this forum for emergency medical situations.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              The Medical Tourism Forum and its operators are not responsible for any medical decisions made based on information found on this platform. Users are solely responsible for their healthcare decisions.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Regulatory Compliance</h2>
            <p className="text-gray-700 mb-4">
              Medical practices and regulations vary by country. Ensure that any medical treatment you consider complies with the laws and regulations of both your home country and the destination country.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this medical disclaimer, please contact us at support@medicaltourismforum.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
