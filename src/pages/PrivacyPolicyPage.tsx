import { StaticPageLayout } from '../components/StaticPageLayout';

export const PrivacyPolicyPage = () => {
    return (
        <StaticPageLayout
            title="Privacy Policy"
            subtitle="Last updated: January 15, 2026"
        >
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">1. Data Minimization</h2>
                <p>
                    Viszmo follows a strict data minimization policy. We only collect the bare minimum information required to operate our AI study tools on Windows and iOS.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">2. How We Handle Screen Data</h2>
                <p>
                    Your privacy is our priority. When using the "Analyze Screen" or "Scan" features:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Local Capture:</strong> The screenshot or image is captured locally on your Windows or iOS device.</li>
                    <li><strong>Secure Transmission:</strong> The extracted text or image is sent securely to our encrypted AI processing servers.</li>
                    <li><strong>Immediate Deletion:</strong> All raw screen data and temporary files are discarded immediately after processing. We do not store your screenshots or analyzed images unless you explicitly choose to save them to your library.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">3. Information Collection</h2>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Account Basics:</strong> We store your email address and encrypted authentication tokens.</li>
                    <li><strong>Payment Data:</strong> Payment processing is handled by Stripe. Viszmo does not store your credit card details on our own servers.</li>
                    <li><strong>Security Logs:</strong> We may collect technical identifiers like IP addresses at signup to prevent duplicate account fraud and maintain platform security.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">4. Third-Party Services</h2>
                <p>
                    We partner with leading AI providers (such as OpenAI and Anthropic) to provide instant answers. These partners only receive the specific text or image content required for the request and do not allow your data to be used for training their public models.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">5. Data Retention</h2>
                <p>
                    You have full control over your saved study material. Any flashcards, quizzes, or lecture notes you generate can be deleted permanently by you at any time.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">6. Privacy Inquiries</h2>
                <p>
                    For any questions regarding your data privacy, please reach out to <a href="mailto:support@Viszmo.com" className="text-[#0ea5e9] hover:underline">support@Viszmo.com</a>.
                </p>
            </section>
        </StaticPageLayout>
    );
};
