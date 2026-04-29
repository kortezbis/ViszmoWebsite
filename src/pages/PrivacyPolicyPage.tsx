import { StaticPageLayout } from '../components/StaticPageLayout';

export const PrivacyPolicyPage = () => {
    return (
        <StaticPageLayout
            title="Privacy Policy"
            subtitle="Last updated: April 29, 2026"
        >
            <section className="space-y-4">
                <p>
                    Welcome to Viszmo. We are committed to protecting your personal information and your right to privacy. This Privacy Policy applies to all information collected through our website, mobile application ("App"), and/or any related services, sales, marketing, or events.
                </p>
                <p>
                    Viszmo is designed to be a powerful AI study assistant. To provide this service, we collect certain information to personalize your learning experience.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">1. Information We Collect</h2>
                <p>
                    We collect personal information that you voluntarily provide to us when you register on the App, express an interest in obtaining information about us or our products and services, or otherwise when you contact us.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Account Information:</strong> Email address, Full Name, and Username.</li>
                    <li><strong>Demographic Information:</strong> Age Range (to ensure compliance with age restrictions).</li>
                    <li><strong>Survey and Persona Data:</strong> To tailor your study experience, we collect information regarding your student level (e.g., high school, undergraduate), study goals, and specific study struggles.</li>
                    <li><strong>Subscription Data:</strong> We use <strong>RevenueCat</strong> to manage subscriptions. While we do not store your credit card information directly, RevenueCat and the Apple App Store process your purchase data.</li>
                    <li><strong>Technical Identifiers:</strong> We may collect technical identifiers like IP addresses at signup to prevent duplicate account fraud and maintain platform security.</li>
                </ul>
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
                <h2 className="text-xl font-bold text-slate-900">3. How We Use Your Information</h2>
                <p>We use the information we collect or receive:</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>To Personalize Your Experience:</strong> We use your persona and survey data to tailor study metrics and provide AI-generated study content such as flashcards, lectures, and podcasts specifically relevant to your needs.</li>
                    <li><strong>To Manage User Accounts:</strong> We use <strong>Supabase</strong> for secure authentication and database management to keep your account information safe and accessible.</li>
                    <li><strong>To Improve Our Service:</strong> Analyzing how users interact with our study aids helps us refine our AI models and application features.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">4. Sharing Your Information</h2>
                <p>
                    We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Service Providers:</strong> We use third-party vendors to perform tasks on our behalf. These include <strong>Supabase</strong> (Database/Auth) and <strong>RevenueCat</strong> (Subscription management). These providers are prohibited from using your personal information for any other purpose.</li>
                    <li><strong>Compliance with Law:</strong> We may disclose your information where we are legally required to do so in order to comply with applicable law, governmental requests, a judicial proceeding, court order, or legal process.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">5. Children's Privacy (COPPA Compliance)</h2>
                <p>
                    Viszmo is strictly intended for users <strong>aged 13 and older</strong>. We do not knowingly collect, solicit, or maintain personal information from anyone under the age of 13. If we learn that we have collected personal information from a child under age 13 without verification of parental consent, we will delete that information as quickly as possible. If you believe we might have any information from or about a child under 13, please contact us at <a href="mailto:support@viszmo.com" className="text-[#0ea5e9] hover:underline">support@viszmo.com</a>.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">6. Data Retention and Deletion</h2>
                <p>
                    We keep your information for as long as necessary to fulfill the purposes outlined in this privacy policy unless otherwise required by law.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Account Deletion:</strong> In compliance with Apple App Store Guideline 5.1.1, users have the right to delete their account and all associated data at any time. This can be done directly within the App settings or by contacting support.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">7. Contact Us</h2>
                <p>
                    If you have questions or comments about this policy, you may email us at <a href="mailto:support@viszmo.com" className="text-[#0ea5e9] hover:underline">support@viszmo.com</a>.
                </p>
            </section>
        </StaticPageLayout>
    );
};
