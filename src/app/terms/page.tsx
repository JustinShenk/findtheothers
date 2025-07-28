export default function TermsPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
      
      <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing and using Find the Others, you agree to be bound by these Terms of Service 
            and all applicable laws and regulations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. Use of Service</h2>
          <p>Find the Others is a platform for discovering and connecting with people working on important causes. You agree to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Use the service for lawful purposes only</li>
            <li>Provide accurate information</li>
            <li>Respect other users and their contributions</li>
            <li>Not misrepresent your identity or affiliations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. User Content</h2>
          <p>
            You retain ownership of content you submit. By posting content, you grant us a license to 
            use, display, and distribute it as part of the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Prohibited Activities</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Harassment or abuse of other users</li>
            <li>Posting false or misleading information</li>
            <li>Attempting to breach security measures</li>
            <li>Using the platform for spam or commercial solicitation</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Intellectual Property</h2>
          <p>
            The platform and its original content are protected by copyright and other intellectual 
            property rights. The project is open source under the MIT license.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Limitation of Liability</h2>
          <p>
            Find the Others is provided "as is" without warranties. We are not liable for any 
            damages arising from your use of the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the service after 
            changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">8. Contact</h2>
          <p>
            For questions about these terms, please contact us at legal@findtheothers.org
          </p>
        </section>
      </div>
    </div>
  );
}