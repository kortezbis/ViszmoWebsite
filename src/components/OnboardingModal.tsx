import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

type SurveyData = {
    hearAboutUs: string;
    useCase: string;
    age: string;
    description: string;
};

const STEPS = [
    {
        id: 'hearAboutUs',
        question: 'How did you hear about us?',
        options: [
            { label: 'TikTok', icon: '/dashimages/icons/tiktok.png' },
            { label: 'Instagram', icon: '/dashimages/icons/instagram.png' },
            { label: 'YouTube', icon: '/dashimages/icons/youtube.png' },
            { label: 'Google Search', icon: '/dashimages/icons/google.png' },
            { label: 'Reddit', icon: '/dashimages/icons/reddit-logo.png' },
            { label: 'Friend/Referral', icon: '/dashimages/icons/friendship.png' },
            { label: 'Other', icon: '/dashimages/icons/effects.png' }
        ]
    },
    {
        id: 'description',
        question: 'What best describes you?',
        options: [
            { label: 'Middle School', icon: '/dashimages/surveyimages/education.png' },
            { label: 'High School', icon: '/dashimages/surveyimages/daycare.png' },
            { label: 'College/University', icon: '/dashimages/surveyimages/school.png' },
            { label: 'Graduate Student', icon: '/dashimages/surveyimages/graduation.png' },
            { label: 'Medical/Law', icon: '/dashimages/surveyimages/report.png' },
            { label: 'Professional', icon: '/dashimages/surveyimages/bag.png' },
            { label: 'Hobbyist', icon: '/dashimages/surveyimages/star.png' }
        ]
    },
    {
        id: 'useCase',
        question: 'What is your primary use case?',
        options: [
            { label: 'Study Overlay', icon: '/dashimages/icons/effects.png' },
            { label: 'Lecture Transcription', icon: '/dashimages/icons/voice.png' },
            { label: 'Study Features', icon: '/dashimages/icons/book.png' },
            { label: 'All Access', icon: '/dashimages/icons/Fire.png' }
        ]
    },
    {
        id: 'age',
        question: 'How old are you?',
        type: 'input',
        placeholder: '00'
    }
];

interface OnboardingModalProps {
    isOpen: boolean;
    onComplete: () => void;
}

export const OnboardingModal = ({ isOpen, onComplete }: OnboardingModalProps) => {
    const { userId } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [data, setData] = useState<SurveyData>({
        hearAboutUs: '',
        useCase: '',
        age: '',
        description: ''
    });

    // Reset survey when opened
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
            setData({
                hearAboutUs: '',
                useCase: '',
                age: '',
                description: ''
            });
        }
    }, [isOpen]);

    // Body scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const stepInfo = STEPS[currentStep];

    const handleNext = async () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Complete onboarding
            if (!userId || isSubmitting) return;
            
            setIsSubmitting(true);
            try {
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        onboarding_completed: true,
                        onboarding_data: data,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userId);

                if (error) throw error;
                onComplete();
            } catch (error) {
                console.error('Error saving onboarding data:', error);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSelect = (option: string) => {
        setData({ ...data, [stepInfo.id]: option });
        if (stepInfo.id !== 'age') {
            setTimeout(handleNext, 300);
        }
    };

    const canContinue = data[stepInfo.id as keyof SurveyData] !== '';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop - NO onClick to close */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="relative w-full max-w-[540px] h-[480px] bg-white rounded-[2rem] shadow-2xl shadow-slate-900/20 overflow-hidden flex flex-col"
                    >
                        {/* Progress Bar at the absolute top center */}
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                            {STEPS.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-6 bg-[#0ea5e9]' : 'w-2 bg-slate-100'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="px-10 pb-8 pt-12 flex-1 flex flex-col justify-center min-h-0">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex-1 flex flex-col"
                                >
                                    <h2 className="text-lg font-black text-slate-900 tracking-tight mb-4 text-center leading-tight">
                                        {stepInfo.question}
                                    </h2>

                                    <div className="grid grid-cols-2 gap-2 overflow-y-auto pr-1 custom-scrollbar flex-1 pb-2">
                                        {stepInfo.id === 'age' ? (
                                            <div className="col-span-2 flex-1 flex flex-col items-center justify-center pt-4">
                                                <input
                                                    type="number"
                                                    value={data[stepInfo.id as keyof SurveyData]}
                                                    onChange={(e) => setData({ ...data, [stepInfo.id]: e.target.value })}
                                                    onKeyDown={(e) => e.key === 'Enter' && canContinue && handleNext()}
                                                    autoFocus
                                                    min="1"
                                                    max="120"
                                                    className="w-full h-24 bg-slate-50 border-2 border-slate-50 rounded-[28px] px-8 text-4xl font-black text-slate-900 focus:bg-white focus:border-[#0ea5e9] focus:outline-none transition-all placeholder:text-slate-200 text-center"
                                                    placeholder="00"
                                                />
                                            </div>
                                        ) : (
                                            (stepInfo.options as { label: string; icon?: string }[])?.map((option) => (
                                                <button
                                                    key={option.label}
                                                    onClick={() => handleSelect(option.label)}
                                                    className={`group relative flex items-center gap-3 p-2.5 rounded-[16px] border-2 transition-all duration-200 text-left ${data[stepInfo.id as keyof SurveyData] === option.label
                                                        ? 'bg-sky-50 border-[#0ea5e9]'
                                                        : 'bg-white border-slate-50 hover:border-slate-100'
                                                        } ${!option.icon ? 'justify-center py-5' : ''}`}
                                                >
                                                    {option.icon && (
                                                        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${data[stepInfo.id as keyof SurveyData] === option.label ? 'bg-white' : 'bg-slate-50'
                                                            }`}>
                                                            <img src={option.icon} alt={option.label} className="w-5 h-5 object-contain" />
                                                        </div>
                                                    )}
                                                    <span className={`text-[13px] font-bold leading-tight ${data[stepInfo.id as keyof SurveyData] === option.label ? 'text-[#0ea5e9]' : 'text-slate-700'
                                                        } ${!option.icon ? 'text-[15px] text-center' : ''}`}>
                                                        {option.label}
                                                    </span>
                                                </button>
                                            ))
                                        )}
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                                        <button
                                            onClick={handleBack}
                                            disabled={currentStep === 0 || isSubmitting}
                                            className={`flex items-center gap-2 font-bold text-sm transition-colors ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-slate-600'
                                                } disabled:opacity-20`}
                                        >
                                            <ArrowLeft size={16} />
                                            Back
                                        </button>

                                        {stepInfo.id === 'age' && (
                                            <button
                                                onClick={handleNext}
                                                disabled={!canContinue || isSubmitting}
                                                className="bg-[#0ea5e9] text-white px-10 py-3 rounded-2xl font-bold text-base hover:bg-[#0284c7] transition-all shadow-lg shadow-sky-100 disabled:opacity-40 disabled:shadow-none translate-x-1"
                                            >
                                                {isSubmitting ? 'Saving...' : 'Submit'}
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
