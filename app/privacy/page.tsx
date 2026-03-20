import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-cream">
      <Nav />
      <div className="pt-28 pb-20 max-w-3xl mx-auto px-6">
        <p className="section-label mb-4">Legal</p>
        <h1 className="heading-display text-4xl text-charcoal mb-8">Privacy Policy</h1>
        <div className="prose-foundher">
          <p><strong>Effective Date:</strong> March 20, 2026</p>
          <p><strong>Last Updated:</strong> March 20, 2026</p>

          <h2>1. Introduction</h2>
          <p>
            FoundHer Grants (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), a product of Huit.AI, LLC, operates the website 
            foundher-grants.vercel.app and related services (collectively, the &ldquo;Platform&rdquo;). This Privacy Policy describes 
            how we collect, use, disclose, and protect your personal information when you use our Platform.
          </p>

          <h2>2. Information We Collect</h2>
          <p>
            We collect information you provide directly, including your name, email address, business details, 
            certification status (e.g., WOSB, WBE, Tribal 8(a)), and organizational profile data entered during 
            onboarding. We also collect usage data such as pages visited, search queries, and feature interactions 
            through standard analytics tools.
          </p>

          <h2>3. How We Use Your Information</h2>
          <p>
            We use your information to provide personalized grant matching and eligibility scoring, generate 
            AI-assisted grant application drafts, send deadline alerts and grant digest notifications, process 
            payments through our third-party payment processor (Stripe), and improve our Platform and services.
          </p>

          <h2>4. AI-Generated Content</h2>
          <p>
            Our Platform uses artificial intelligence to generate grant application drafts and recommendations. 
            AI-generated content is produced based on the information you provide and publicly available grant 
            program data. You are solely responsible for reviewing, verifying, and approving all AI-generated 
            content before submission to any funding agency.
          </p>

          <h2>5. Data Sharing</h2>
          <p>
            We do not sell your personal information. We may share information with service providers who assist 
            in operating our Platform (e.g., Supabase for data storage, Stripe for payment processing, Vercel 
            for hosting). We may also disclose information if required by law or to protect our rights.
          </p>

          <h2>6. Data Security</h2>
          <p>
            We implement industry-standard security measures including encryption in transit (TLS) and at rest, 
            secure authentication, and access controls. However, no method of transmission over the Internet is 
            100% secure, and we cannot guarantee absolute security.
          </p>

          <h2>7. Data Retention</h2>
          <p>
            We retain your personal information for as long as your account is active or as needed to provide 
            services. You may request deletion of your account and associated data by contacting us at 
            privacy@huit.ai.
          </p>

          <h2>8. Your Rights</h2>
          <p>
            Depending on your jurisdiction, you may have the right to access, correct, delete, or port your 
            personal data. To exercise these rights, contact us at privacy@huit.ai.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes by 
            posting the updated policy on our Platform with a revised effective date.
          </p>

          <h2>10. Contact</h2>
          <p>
            For questions about this Privacy Policy, contact us at:<br />
            <strong>Email:</strong> privacy@huit.ai<br />
            <strong>Company:</strong> Huit.AI, LLC
          </p>
        </div>
      </div>
      <Footer />
    </main>
  )
}
