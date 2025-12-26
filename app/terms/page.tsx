export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
          <p className="text-white/90">Last updated: December 15, 2025</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="bg-white dark:bg-slate-950 rounded-lg p-8 space-y-6 text-foreground">
          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">1. Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing the My Campus Library application, you are agreeing to be bound by these
              terms of service, all applicable laws and regulations, and agree that you are
              responsible for compliance with any applicable local laws. If you do not agree with
              any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">2. Use License</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Permission is granted to temporarily download one copy of the materials (information
              or software) on My Campus Library for personal, non-commercial transitory viewing
              only. This is the grant of a license, not a transfer of title, and under this license
              you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Modify or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software</li>
              <li>Removing any copyright or other proprietary notations</li>
              <li>Transferring the materials to another person or "mirroring" the materials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">3. Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              The materials on My Campus Library are provided on an 'as is' basis. My Campus Library
              makes no warranties, expressed or implied, and hereby disclaims and negates all other
              warranties including, without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or non-infringement of intellectual
              property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">4. Limitations</h2>
            <p className="text-muted-foreground leading-relaxed">
              In no event shall My Campus Library or its suppliers be liable for any damages
              (including, without limitation, damages for loss of data or profit, or due to business
              interruption) arising out of the use or inability to use the materials on My Campus
              Library, even if My Campus Library or an authorized representative has been notified
              orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">5. Accuracy of Materials</h2>
            <p className="text-muted-foreground leading-relaxed">
              The materials appearing on My Campus Library could include technical, typographical,
              or photographic errors. My Campus Library does not warrant that any of the materials
              on its website are accurate, complete, or current. My Campus Library may make changes
              to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-primary mb-3">6. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms and Conditions, please contact us at:
              spectra010s@gmail.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
