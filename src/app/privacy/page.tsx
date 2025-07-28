export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Overview</h2>
          <p>
            Find the Others respects your privacy and is committed to protecting your personal data. 
            This privacy policy explains how we collect, use, and safeguard your information.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Account information (email, name) when you sign up</li>
            <li>Profile information you choose to provide</li>
            <li>Usage data to improve our services</li>
            <li>Technical data for platform functionality</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide and maintain our service</li>
            <li>To connect you with relevant causes and contributors</li>
            <li>To improve our platform and user experience</li>
            <li>To communicate important updates</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Data Protection</h2>
          <p>
            We implement appropriate security measures to protect your personal information. 
            Your data is encrypted and stored securely.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
          <p>
            If you have questions about this privacy policy, please contact us at 
            privacy@findtheothers.org
          </p>
        </section>
      </div>
    </div>
  );
}