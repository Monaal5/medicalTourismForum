export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Cookie Policy</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">What Are Cookies</h2>
            <p className="text-gray-700 mb-4">
              Cookies are small text files that are placed on your computer or mobile device when you visit our website. They help us provide you with a better experience by remembering your preferences and enabling certain functionality.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">How We Use Cookies</h2>
            <p className="text-gray-700 mb-4">
              We use cookies for the following purposes:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
              <li>Authentication and security</li>
              <li>Remembering your preferences</li>
              <li>Analytics and performance monitoring</li>
              <li>Improving user experience</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Types of Cookies We Use</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Essential Cookies</h3>
                <p className="text-gray-700">These cookies are necessary for the website to function properly and cannot be disabled.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Analytics Cookies</h3>
                <p className="text-gray-700">These cookies help us understand how visitors interact with our website.</p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Preference Cookies</h3>
                <p className="text-gray-700">These cookies remember your preferences and settings.</p>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Managing Cookies</h2>
            <p className="text-gray-700 mb-4">
              You can control and manage cookies through your browser settings. However, disabling certain cookies may affect the functionality of our website.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Third-Party Cookies</h2>
            <p className="text-gray-700 mb-4">
              We may use third-party services that set their own cookies. These services have their own cookie policies.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about our use of cookies, please contact us at privacy@medicaltourismforum.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
