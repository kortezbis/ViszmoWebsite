import { StaticPageLayout } from '../components/StaticPageLayout';

export const TermsOfServicePage = () => {
    return (
        <StaticPageLayout
            title="Terms of Service"
            subtitle="Last updated: April 29, 2026"
        >
            <section className="space-y-4">
                <p>
                    By using the Viszmo application and website ("Service"), you agree to be bound by the following terms and conditions.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">1. Agreement to Terms</h2>
                <p>
                    By accessing or using our Service, you agree that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree with all of these terms, then you are expressly prohibited from using the Service and must discontinue use immediately.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">2. Eligibility</h2>
                <p>
                    You must be at least <strong>13 years of age</strong> to use Viszmo. By using the Service, you represent and warrant that you meet this age requirement.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">3. User Accounts</h2>
                <p>
                    When you create an account, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Community Standards:</strong> We reserve the right to terminate or suspend accounts that violate our community standards, including but not limited to the use of the Service for illegal activities, harassment, or attempts to circumvent our security measures.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">4. Subscriptions (Viszmo Pro)</h2>
                <p>
                    We offer a "Viszmo Pro" subscription which provides enhanced features and AI capabilities.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Management:</strong> Subscriptions are managed and processed through the <strong>Apple App Store</strong>.</li>
                    <li><strong>Billing:</strong> You will be billed according to the terms of the Apple App Store. Any questions regarding billing or refunds must be directed to Apple Support.</li>
                    <li><strong>Cancellation:</strong> You can cancel your subscription at any time through your Apple ID settings.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">5. AI-Generated Content Disclaimer</h2>
                <p>
                    Viszmo uses artificial intelligence to generate study materials, including flashcards, lectures, and podcasts.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Verification:</strong> AI-generated content may contain inaccuracies. Users are responsible for verifying all content for accuracy and completeness.</li>
                    <li><strong>Purpose:</strong> Viszmo is intended as a <strong>study aid</strong> and supplement to your education. It is NOT a replacement for official course materials, textbooks, or instructor-led learning.</li>
                    <li><strong>No Warranty:</strong> We do not warrant the accuracy, reliability, or completeness of any AI-generated content.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">6. Limitation of Liability</h2>
                <p>
                    In no event shall Viszmo, nor its directors, employees, or partners, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, or other intangible losses, resulting from your use of the Service.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">7. Changes to Terms</h2>
                <p>
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide notice of any significant changes by updating the "Last Updated" date at the top of these Terms.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">8. Contact Us</h2>
                <p>
                    If you have any questions about these Terms, please contact us at <a href="mailto:support@viszmo.com" className="text-[#0ea5e9] hover:underline">support@viszmo.com</a>.
                </p>
            </section>
        </StaticPageLayout>
    );
};
