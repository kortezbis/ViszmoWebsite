import { StaticPageLayout } from '../components/StaticPageLayout';

export const ContactUsPage = () => {
    return (
        <StaticPageLayout
            title="Contact Support"
            subtitle="We're here to help you succeed. Get in touch with our team."
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Get in touch Card */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40">
                        <h3 className="text-xl font-black text-slate-900 mb-8">Get in touch</h3>

                        <div className="space-y-8">
                            {/* Email Support */}
                            <div>
                                <h4 className="font-bold text-slate-900 text-base">Email Support</h4>
                                <p className="text-sm text-slate-400 italic mb-1">Fastest way to get help</p>
                                <a href="mailto:support@Viszmo.com" className="block text-lg font-black text-[#0ea5e9] hover:underline mb-1">
                                    support@Viszmo.com
                                </a>
                                <p className="text-sm text-slate-500 leading-relaxed">
                                    Please email us directly for any inquiries.
                                </p>
                            </div>

                            {/* Response Time */}
                            <div>
                                <h4 className="font-bold text-slate-900 text-base">Response Time</h4>
                                <p className="text-sm text-slate-500 leading-relaxed mt-1">
                                    We typically respond within <span className="font-bold text-slate-900">2-4 hours</span> during business days.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Secure & Private Card */}
                    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40">
                        <h3 className="text-xl font-black text-slate-900 mb-2">Secure & Private</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Your privacy is our priority. All support inquiries are handled discreetly and your data remains 100% confidential.
                        </p>
                    </div>
                </div>

                {/* Right Column - FAQ */}
                <div className="space-y-6">
                    <h3 className="text-xl font-black text-slate-900">Common Questions</h3>

                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="font-bold text-slate-900 mb-2">How do I install Viszmo?</h4>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Download the Windows installer from our home page and follow the setup guide.
                        </p>
                    </div>



                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="font-bold text-slate-900 mb-2">Does this work on Mac?</h4>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Currently we only support Windows 10 & 11. Mac version is in development.
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="font-bold text-slate-900 mb-2">Is it private and discrete?</h4>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Yes, our external overlay doesn't touch your browser at all, making it completely private and hidden from screen capture and meetings.
                        </p>
                    </div>
                </div>
            </div>
        </StaticPageLayout>
    );
};
