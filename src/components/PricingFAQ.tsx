import { HelpCircle, Calendar, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export const PricingFAQ = () => {
    const questions = [
        {
            icon: <HelpCircle className="w-6 h-6 text-[#0ea5e9]" />,
            question: "What does unlimited access mean?",
            answer: "With any paid pass, you get unlimited access to all features: screen scans, study material generation, transcript AI, and both Smart and Brilliant AI models. Use as much as you need during your access period."
        },
        {
            icon: <Calendar className="w-6 h-6 text-[#0ea5e9]" />,
            question: "What happens when my pass expires?",
            answer: "Your access pauses until you get a new pass. If you have any free uses remaining from signup or referrals, you can still use those."
        },
        {
            icon: <PlusCircle className="w-6 h-6 text-[#0ea5e9]" />,
            question: "Can I stack passes?",
            answer: "Yes! If you buy a Week Pass while your Day Pass is still active, the time gets added. Buy today and your 7 days start from now."
        },
    ];

    return (
        <section className="pb-32 pt-10 relative">
            <div className="max-w-4xl mx-auto px-4 md:px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-4"
                    >
                        Common <span className="text-[#0ea5e9]">Questions</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-base sm:text-lg text-slate-500 font-medium px-2"
                    >
                        Everything you need to know about Viszmo Pricing.
                    </motion.p>
                </div>

                {/* FAQ Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 sm:gap-x-12 gap-y-8 sm:gap-y-12">
                    {questions.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="flex gap-4 items-start"
                        >
                            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                                {item.icon}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight">
                                    {item.question}
                                </h3>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                    {item.answer}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
