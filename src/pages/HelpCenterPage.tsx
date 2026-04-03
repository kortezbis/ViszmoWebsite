import { useState } from 'react';
import { StaticPageLayout } from '../components/StaticPageLayout';
import { Download, Zap, Users, HelpCircle, Monitor, Layout, AlertTriangle, MessageSquare, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const HelpCenterPage = () => {
    return (
        <StaticPageLayout
            title="How can we help?"
            subtitle="Find answers to common questions, learn how to use Viszmo, and get support when you need it."
        >


            {/* Top Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all group text-center cursor-pointer">
                    <div className="mx-auto text-[#0ea5e9] mb-6 group-hover:scale-110 transition-transform">
                        <Download className="w-10 h-10 mx-auto" />
                    </div>
                    <div className="group inline-block bg-[#0ea5e9] shadow-[#0ea5e9]/20 -skew-x-12 px-4 py-1.5 shadow-md transform transition-all duration-300 hover:skew-x-0 hover:scale-105 mb-2">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider transform skew-x-12 transition-all duration-300 group-hover:skew-x-0 whitespace-nowrap">
                            Download Viszmo
                        </h3>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-2">Get started for free</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white hover:border-purple-200 hover:shadow-lg hover:shadow-purple-500/5 transition-all group text-center cursor-pointer">
                    <div className="mx-auto text-purple-500 mb-6 group-hover:scale-110 transition-transform">
                        <Zap className="w-10 h-10 mx-auto" />
                    </div>
                    <div className="group inline-block bg-purple-500 shadow-purple-500/20 -skew-x-12 px-4 py-1.5 shadow-md transform transition-all duration-300 hover:skew-x-0 hover:scale-105 mb-2">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider transform skew-x-12 transition-all duration-300 group-hover:skew-x-0 whitespace-nowrap">
                            View Features
                        </h3>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-2">See what Viszmo can do</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group text-center cursor-pointer">
                    <div className="mx-auto text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
                        <Users className="w-10 h-10 mx-auto" />
                    </div>
                    <div className="group inline-block bg-emerald-500 shadow-emerald-500/20 -skew-x-12 px-4 py-1.5 shadow-md transform transition-all duration-300 hover:skew-x-0 hover:scale-105 mb-2">
                        <h3 className="text-sm font-black text-white uppercase tracking-wider transform skew-x-12 transition-all duration-300 group-hover:skew-x-0 whitespace-nowrap">
                            Contact Support
                        </h3>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-2">Get help via email or form</p>
                </div>
            </div>

            <div className="space-y-16">
                {/* FAQ Section title */}
                <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Frequently Asked Questions</h2>

                    {/* Getting Started */}
                    <div className="mb-12">
                        <div className="flex items-center gap-6 mb-6 pb-4 border-b border-slate-100">
                            <div className="text-[#0ea5e9]">
                                <HelpCircle className="w-8 h-8" />
                            </div>
                            <div>
                                <div className="group inline-block bg-[#0ea5e9] shadow-[#0ea5e9]/20 -skew-x-12 px-4 py-1.5 shadow-md transform transition-all duration-300 hover:skew-x-0 hover:scale-105 mb-1">
                                    <h3 className="text-sm font-black text-white uppercase tracking-wider transform skew-x-12 transition-all duration-300 group-hover:skew-x-0 whitespace-nowrap">
                                        Getting Started
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <AccordionArticle
                                title="How do I download and install Viszmo?"
                                text='Visit our homepage and click "Download Free". Run the installer—Windows may show a warning since we don&apos;t have a code signing certificate yet. Click "More info" then "Run anyway" to proceed. Viszmo installs as "vsdrv" for stealth.'
                            />
                            <AccordionArticle
                                title="How do I use the AI Overlay?"
                                text='After installing, launch Viszmo from your dashboard by clicking "Start Session". The overlay will appear on your screen. Click "Scan" to capture any area—the AI will analyze it and give you an answer with explanation. Use the chat for follow-up questions.'
                            />
                            <AccordionArticle
                                title="What can I use Viszmo for?"
                                text="Viszmo is perfect for homework, exams, studying, coding help, and any situation where you need quick AI assistance. It works with lockdown browsers and proctoring tools."
                            />
                            <AccordionArticle
                                title="Is there a free trial?"
                                text="Yes! Every new account gets 15 free AI messages to try all features—no credit card required. Sign up with a referral link to get 30 free AI messages instead."
                            />
                        </div>
                    </div>

                    {/* Using the Overlay */}
                    <div className="mb-12">
                        <div className="flex items-center gap-6 mb-6 pb-4 border-b border-slate-100">
                            <div className="text-indigo-500">
                                <Monitor className="w-8 h-8" />
                            </div>
                            <div>
                                <div className="group inline-block bg-indigo-500 shadow-indigo-500/20 -skew-x-12 px-4 py-1.5 shadow-md transform transition-all duration-300 hover:skew-x-0 hover:scale-105 mb-1">
                                    <h3 className="text-sm font-black text-white uppercase tracking-wider transform skew-x-12 transition-all duration-300 group-hover:skew-x-0 whitespace-nowrap">
                                        Using the Overlay
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <AccordionArticle
                                title="How do I capture my screen?"
                                text='Click the "Scan" button in the overlay. The AI will capture what&apos;s behind the overlay and analyze it instantly. You&apos;ll get both an answer and a detailed explanation.'
                            />
                            <AccordionArticle
                                title="Can I chat with the AI about my capture?"
                                text="Yes! After scanning, you can ask follow-up questions in the chat. The AI remembers the context and can help you understand diagrams, formulas, or anything in the scanned content."
                            />
                            <AccordionArticle
                                title="What's the difference between Smart and Brilliant modes?"
                                text="Smart mode is fast and optimized for quick questions and simple tasks. Brilliant mode uses a more powerful AI for complex problems, multi-step reasoning, and detailed explanations."
                            />
                            <AccordionArticle
                                title="Why can't I see the overlay?"
                                text='Make sure Viszmo is running—check your system tray for the icon. Try clicking "Start Session" from the dashboard. If using multiple monitors, check which display the overlay is on.'
                            />
                            <AccordionArticle
                                title="What is Auto-Scan mode?"
                                text="Auto-Scan captures your screen automatically at set intervals (20-60 seconds) without any clicking. Perfect for hands-free use during lockdown exams. Enable it from the overlay settings."
                            />
                        </div>
                    </div>

                    {/* Study Hub */}
                    <div className="mb-12">
                        <div className="flex items-center gap-6 mb-6 pb-4 border-b border-slate-100">
                            <div className="text-purple-500">
                                <Layout className="w-8 h-8" />
                            </div>
                            <div>
                                <div className="group inline-block bg-purple-500 shadow-purple-500/20 -skew-x-12 px-4 py-1.5 shadow-md transform transition-all duration-300 hover:skew-x-0 hover:scale-105 mb-1">
                                    <h3 className="text-sm font-black text-white uppercase tracking-wider transform skew-x-12 transition-all duration-300 group-hover:skew-x-0 whitespace-nowrap">
                                        Study Hub
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <AccordionArticle
                                title="How do I generate study materials?"
                                text="Go to the Study Hub in the desktop app. Add content via file upload (PDF, TXT, DOCX), paste text directly, add a website link, or select a saved transcript. Choose your material type and click Generate."
                            />
                            <AccordionArticle
                                title="What types of study materials can I create?"
                                text="You can generate Flashcards, Quizzes, Practice Exams, Study Guides, Key Terms, Simplified Explanations, and more. All materials are saved to your Library for later access."
                            />
                            <AccordionArticle
                                title="How does transcription work?"
                                text="Record lectures or meetings using your microphone or system audio. You get real-time transcription as you record. AI tools let you summarize, extract key points, and generate action items from any transcript."
                            />
                            <AccordionArticle
                                title="Are my study materials saved?"
                                text="Yes! All generated materials are saved to your Library (Vault) and can be accessed anytime from the dashboard."
                            />
                        </div>
                    </div>

                    {/* Troubleshooting */}
                    <div className="mb-12">
                        <div className="flex items-center gap-6 mb-6 pb-4 border-b border-slate-100">
                            <div className="text-red-500">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <div>
                                <div className="group inline-block bg-red-500 shadow-red-500/20 -skew-x-12 px-4 py-1.5 shadow-md transform transition-all duration-300 hover:skew-x-0 hover:scale-105 mb-1">
                                    <h3 className="text-sm font-black text-white uppercase tracking-wider transform skew-x-12 transition-all duration-300 group-hover:skew-x-0 whitespace-nowrap">
                                        Troubleshooting
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <AccordionArticle
                                title="The app won't start or crashes"
                                text="Try restarting your computer. Make sure you have the latest version installed. If the problem persists, uninstall and reinstall Viszmo from the download page."
                            />
                            <AccordionArticle
                                title='I&apos;m not getting AI responses'
                                text="Check your internet connection. Make sure you haven't reached your daily usage limit (check your Account page). If the issue persists, try signing out and back in."
                            />
                            <AccordionArticle
                                title="My subscription isn't showing up after purchase"
                                text="Subscriptions usually activate within a few minutes. Try refreshing the page or restarting the app. If your features are still locked after 10 minutes, contact support."
                            />
                            <AccordionArticle
                                title="How do I reopen Viszmo after closing it?"
                                text='Search for "vsdrv" in your Windows search bar and launch it. Viszmo installs with this name for stealth purposes.'
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Support CTA */}
            <div className="mt-16 text-center space-y-6 bg-transparent py-8 md:py-12">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
                    Still need help?
                </h2>
                <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                    Can't find what you're looking for? Our support team is happy to assist.
                </p>
                <div className="flex justify-center pt-4">
                    <div className="btn-wrapper">
                        <a href="/contact">
                            <button className="btn btn-black">
                                <MessageSquare className="w-5 h-5 text-white mr-2" />
                                <span className="btn-text">Email Support</span>
                            </button>
                        </a>
                    </div>
                </div>
                <p className="text-[10px] md:text-xs font-bold text-slate-400 tracking-widest uppercase mt-4">
                    We usually respond within 24 hours
                </p>
            </div>
        </StaticPageLayout>
    );
};

const AccordionArticle = ({ title, text }: { title: string; text: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-left"
            >
                <h4 className={`text-base font-bold transition-colors ${isOpen ? 'text-[#0ea5e9]' : 'text-slate-900'}`}>
                    {title}
                </h4>
                <div className={`p-1 rounded-full transition-colors ${isOpen ? 'bg-blue-50 text-[#0ea5e9]' : 'text-slate-400'}`}>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                        <div className="px-4 pb-4 pt-0">
                            <p className="text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
                                {text}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
