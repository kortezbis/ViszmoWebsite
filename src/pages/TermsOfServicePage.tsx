import { StaticPageLayout } from '../components/StaticPageLayout';

export const TermsOfServicePage = () => {
    return (
        <StaticPageLayout
            title="Terms of Service"
            subtitle="Last updated: January 15, 2026"
        >
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">1. Agreement to Terms</h2>
                <p>
                    By accessing or using Viszmo ("the Service"), you agree to be bound by these Terms of Service. Viszmo is an AI study assistant designed for Windows 10 and Windows 11.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">2. Usage and Subscriptions</h2>
                <p>
                    Viszmo provides access to AI processing features through free daily limits or paid subscription plans.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Usage Limits:</strong> Access to certain AI features may be subject to daily or monthly limits depending on your plan.</li>
                    <li><strong>All Purchases Final:</strong> Due to the nature of digital services and AI processing costs, all subscription purchases and upgrades are final and non-refundable.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">3. Acceptable Use & Stealth Technology</h2>
                <p>
                    Viszmo's proprietary technology and transparent overlay technology are provided to enhance your study experience.
                </p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Academic Integrity:</strong> You are solely responsible for ensuring that your use of Viszmo complies with your educational institution's academic integrity policies. Viszmo is intended as an educational aid and study tutor.</li>
                    <li><strong>Prohibited Actions:</strong> You may not attempt to reverse engineer the desktop application, bypass usage limits, or use the service for any illegal activities.</li>
                </ul>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">4. Disclaimer of Warranties</h2>
                <p>
                    Viszmo is provided on an "as is" and "as available" basis. We do not warrant that the service will be 100% uninterrupted, or error-free, although we strive for maximum reliability.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">5. Limitation of Liability</h2>
                <p>
                    Viszmo shall not be liable for any academic consequences, including but not limited to failing grades or disciplinary actions, resulting from the use or misuse of the Service.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">6. Contact</h2>
                <p>
                    For legal inquiries or terms clarification, please contact <a href="mailto:support@Viszmo.com" className="text-[#0ea5e9] hover:underline">support@Viszmo.com</a>.
                </p>
            </section>
        </StaticPageLayout>
    );
};
