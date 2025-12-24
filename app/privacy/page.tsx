export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-white/90">Last updated: December 15, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-12 px-6 prose prose-invert max-w-none">
        <div className="bg-white dark:bg-slate-950 rounded-lg p-8 space-y-6 text-foreground">
          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              My Campus Library ("we," "us," "our," or "Company") operates the My Campus Library
              application. This page informs you of our policies regarding the collection, use, and
              disclosure of personal data when you use our service and the choices you have
              associated with that data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">
              2. Information Collection and Use
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We collect several different types of information for various purposes to provide and
              improve our service to you.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Account information (email, name, username, Third-party Accounts )</li>
              <li>Usage data (resources viewed, downloaded, bookmarks)</li>
              <li>Technical data (IP address, browser type, device information)</li>
              <li>Uploaded resources and associated metadata</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">3. Security of Data</h2>
            <p className="text-muted-foreground leading-relaxed">
              The security of your data is important to us but remember that no method of
              transmission over the Internet or method of electronic storage is 100% secure. While
              we strive to use commercially acceptable means to protect your personal data, we
              cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">
              4. Changes to This Privacy Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the "effective date" at
              the top of this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">5. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:
              spectra010s@gmail.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
