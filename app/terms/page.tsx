import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-cream">
      <Nav />
      <div className="pt-28 pb-20 max-w-3xl mx-auto px-6">
        <p className="section-label mb-4">Legal</p>
        <h1 className="heading-display text-4xl text-charcoal mb-8">Terms of Service</h1>
        <div className="prose-foundher">
          <p><strong>Effective Date:</strong> March 20, 2026</p>
          <p><strong>Last Updated:</strong> March 20, 2026</p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using FoundHer Grants (the &ldquo;Platform&rdquo;), a product of Huit.AI, LLC (&ldquo;Company&rdquo;), 
            you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree, do not use the Platform.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            FoundHer Grants provides a curated grant database, eligibility matching, AI-assisted grant application 
            drafting, deadline tracking, and related tools designed for women-owned, Indigenous-owned, and 
            underrepresented business founders. The Platform is an informational and productivity tool — it does 
            not guarantee grant awards, funding, or application success.
          </p>

          <h2>3. Account Registration</h2>
          <p>
            You must provide accurate, current, and complete information when creating an account. You are 
            responsible for maintaining the confidentiality of your account credentials and for all activity 
            under your account. You must be at least 18 years old to use the Platform.
          </p>

          <h2>4. Subscription and Payments</h2>
          <p>
            Access to certain features requires a paid subscription. Subscription fees are billed monthly 
            through Stripe. The Grant Database plan is $29/month. The Grant Concierge plan is $199/month with 
            a 12-month minimum commitment. Prices are subject to change with 30 days&rsquo; notice. Refunds are 
            handled on a case-by-case basis.
          </p>

          <h2>5. AI-Generated Content Disclaimer</h2>
          <p>
            The Platform uses artificial intelligence to generate grant application drafts, recommendations, 
            and analysis. All AI-generated content is provided &ldquo;as-is&rdquo; for informational and drafting purposes 
            only. You are solely responsible for reviewing, verifying, editing, and approving all AI-generated 
            content before submission to any funding agency. The Company does not guarantee the accuracy, 
            completeness, or suitability of AI-generated content for any particular grant program.
          </p>

          <h2>6. User Responsibilities</h2>
          <p>
            You agree to: (a) provide truthful and accurate information in your profile and applications; 
            (b) review all AI-generated content before submission; (c) comply with all applicable federal, 
            state, and local laws regarding grant applications; (d) not use the Platform to submit fraudulent, 
            misleading, or materially inaccurate grant applications; and (e) not reverse-engineer, scrape, or 
            redistribute Platform data or content.
          </p>

          <h2>7. Grant Compliance</h2>
          <p>
            Grant applications are subject to federal and state regulations, including but not limited to OMB 
            Uniform Guidance (2 CFR Part 200), GEPA Section 427, and program-specific requirements. The Platform 
            provides compliance monitoring tools and informational resources, but does not provide legal advice, 
            audit certification, or regulatory compliance clearance. You are responsible for ensuring your 
            applications meet all applicable requirements.
          </p>

          <h2>8. Intellectual Property</h2>
          <p>
            All Platform content, design, software, and branding are the property of Huit.AI, LLC. Grant 
            application drafts generated through your account are your property once generated. You grant the 
            Company a limited license to use anonymized, aggregated data to improve the Platform.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, the Company shall not be liable for any indirect, 
            incidental, special, consequential, or punitive damages arising from your use of the Platform, 
            including but not limited to loss of grant funding, rejected applications, or reliance on 
            AI-generated content. The Company&rsquo;s total liability shall not exceed the amount paid by you in 
            the twelve (12) months preceding the claim.
          </p>

          <h2>10. Termination</h2>
          <p>
            Either party may terminate the account at any time. The Company reserves the right to suspend or 
            terminate accounts that violate these Terms. Upon termination, your access to the Platform will 
            cease, but previously generated application drafts will remain accessible for 30 days for download.
          </p>

          <h2>11. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the State of Alaska, 
            without regard to conflict of law principles.
          </p>

          <h2>12. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of the Platform after changes constitutes 
            acceptance. We will provide notice of material changes via email or Platform notification.
          </p>

          <h2>13. Contact</h2>
          <p>
            For questions about these Terms, contact us at:<br />
            <strong>Email:</strong> legal@huit.ai<br />
            <strong>Company:</strong> Huit.AI, LLC
          </p>
        </div>
      </div>
      <Footer />
    </main>
  )
}
