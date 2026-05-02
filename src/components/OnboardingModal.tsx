import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Loader2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useProfile } from '../contexts/ProfileContext';

type SurveyData = {
    fullName: string;
    age: string;
    referral: string;
    persona: string;
    struggle: string;
    goal: string;
    intent: string;
};

const STEPS = [
    {
        id: 'fullName',
        question: 'What should we call you?',
        type: 'input',
        placeholder: 'Enter your name'
    },
    {
        id: 'age',
        question: 'How old are you?',
        options: [
            { label: '13 to 17' },
            { label: '18 to 24' },
            { label: '25 to 34' },
            { label: '35 - 44' },
            { label: '45 to 54' },
            { label: '55+' }
        ]
    },
    {
        id: 'referral',
        question: 'How did you hear about us?',
        layout: 'grid',
        options: [
            { label: 'TikTok', icon: '/dashimages/branding/tiktok.png.png' },
            { label: 'Instagram', icon: '/dashimages/branding/instagram.png.png' },
            { label: 'Facebook', icon: '/dashimages/branding/facebook.png' },
            { label: 'App Store', icon: '/dashimages/branding/applestore.png' },
            { label: 'YouTube', icon: '/dashimages/branding/youtube.png.png' },
            { label: 'Google Search', icon: '/dashimages/branding/google.png.png' },
            { label: 'X / Twitter', icon: '/dashimages/branding/twitter.png' },
            { label: 'Our Website', icon: '/dashimages/branding/web-browser.png' },
            { label: 'Reddit', icon: '/dashimages/branding/reddit-logo.png.png' },
            { label: 'Friend/Referral', icon: '/dashimages/branding/friendship.png.png' },
            { label: 'Other', icon: '/dashimages/branding/survey/other.png' }
        ]
    },
    {
        id: 'persona',
        question: 'What best describes you?',
        options: [
            { label: 'Middle School', description: 'Starting my journey', icon: '/dashimages/branding/survey/education.png' },
            { label: 'High School', description: 'Preparing for college', icon: '/dashimages/branding/survey/MiddleSchool.png' },
            { label: 'College/University', description: 'Focusing on my degree', icon: '/dashimages/branding/survey/highschool.png' },
            { label: 'Graduate Student', description: 'Advanced research', icon: '/dashimages/branding/survey/graduation.png' },
            { label: 'Medical/Law', description: 'Professional license prep', icon: '/dashimages/branding/survey/Medicallaw.png' },
            { label: 'Professional', description: 'Upskilling for work', icon: '/dashimages/branding/survey/bag.png' },
            { label: 'Hobbyist', description: 'Learning for fun', icon: '/dashimages/branding/survey/hobbyist.png' }
        ]
    },
    {
        id: 'struggle',
        question: "What's your biggest study struggle?",
        options: [
            { label: 'Too much to read', description: 'Drowning in textbooks', icon: '/dashimages/branding/survey/overload.png' },
            { label: "Can't stay focused", description: 'Scrolling instead of studying', icon: '/dashimages/branding/survey/vision.png' },
            { label: 'Forgetting info fast', description: 'Information goes in and out', icon: '/dashimages/branding/survey/solutions.png' },
            { label: 'Messy lecture notes', description: 'Difficult to review later', icon: '/dashimages/branding/survey/confusion.png' },
            { label: 'Other', description: 'Something else', icon: '/dashimages/branding/survey/other.png' }
        ]
    },
    {
        id: 'goal',
        question: "What's your daily study goal?",
        options: [
            { label: '15 mins / day', description: 'Quick daily drills', icon: '/dashimages/branding/survey/clock.png' },
            { label: '30 mins / day', description: 'Consistent progress', icon: '/dashimages/branding/survey/clock.png' },
            { label: '1 hour / day', description: 'Deep study sessions', icon: '/dashimages/branding/survey/clock.png' },
            { label: '2+ hours / day', description: 'Serious academic heavy-lifting', icon: '/dashimages/branding/survey/clock.png' }
        ]
    },
    {
        id: 'intent',
        question: 'Main reason for using Viszmo?',
        options: [
            { label: 'Study Modes', description: 'Rapid fire, Flashcards, and Test prep', icon: '/dashimages/branding/survey/studymode.png' },
            { label: 'Lecture Modes', description: 'Lecture transcription and Analysis', icon: '/dashimages/branding/survey/seminar.png' },
            { label: 'Sync with Desktop/Mobile', description: 'Cross-platform productivity', icon: '/dashimages/branding/survey/sync.png' },
            { label: 'Just Exploring', description: 'Getting to know Viszmo', icon: '/dashimages/branding/survey/map.png' }
        ]
    }
];

interface OnboardingModalProps {
    isOpen: boolean;
    onComplete: () => void;
}

export const OnboardingModal = ({ isOpen, onComplete }: OnboardingModalProps) => {
    const { userId } = useAuth();
    const { profile, refreshProfile } = useProfile();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [data, setData] = useState<SurveyData>({
        fullName: '',
        age: '',
        referral: '',
        persona: '',
        struggle: '',
        goal: '',
        intent: ''
    });

    // Sync initial name from profile
    useEffect(() => {
        if (profile?.full_name && !data.fullName) {
            setData(prev => ({ ...prev, fullName: profile.full_name || '' }));
        }
    }, [profile]);

    // Reset survey when opened
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
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

    const [isPreparing, setIsPreparing] = useState(false);

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
                        full_name: data.fullName,
                        age: data.age,
                        onboarding_completed: true,
                        onboarding_data: data,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', userId);

                if (error) throw error;
                
                // Transition to Preparing state
                setIsPreparing(true);
                await new Promise(resolve => setTimeout(resolve, 2500));
                
                await refreshProfile();
                onComplete();
            } catch (error) {
                console.error('Error saving onboarding data:', error);
            } finally {
                setIsSubmitting(false);
                setIsPreparing(false);
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
        setTimeout(handleNext, 300);
    };

    const canContinue = data[stepInfo.id as keyof SurveyData] !== '';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-[800px] max-h-[90vh] bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col border border-white/20"
                    >
                        <AnimatePresence mode="wait">
                            {isPreparing ? (
                                <motion.div
                                    key="preparing"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-20 bg-white flex flex-col items-center justify-center p-12 text-center"
                                >
                                    <div className="relative mb-8">
                                        <div className="w-24 h-24 border-4 border-slate-100 rounded-full" />
                                        <motion.div
                                            className="absolute inset-0 border-4 border-t-[#0ea5e9] rounded-full"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                        />
                                        <motion.div
                                            className="absolute inset-0 flex items-center justify-center"
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                        >
                                            <Check className="text-[#0ea5e9] w-8 h-8" strokeWidth={3} />
                                        </motion.div>
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 mb-4">Setting up your space</h2>
                                    <p className="text-slate-500 font-medium leading-relaxed">
                                        We're personalizing your Viszmo experience based on your study habits. Just a moment...
                                    </p>
                                    
                                    <div className="absolute bottom-12 left-12 right-12">
                                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <motion.div 
                                                className="h-full bg-gradient-to-r from-[#0ea5e9] to-indigo-500"
                                                initial={{ width: "0%" }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 2.5, ease: "easeInOut" }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ) : null}
                        </AnimatePresence>

                        {/* Progress Bar */}
                        <div className="absolute top-8 left-0 right-0 px-12 flex gap-1 z-10">
                            {STEPS.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all duration-500 ease-out flex-1 ${idx <= currentStep ? 'bg-[#0ea5e9]' : 'bg-slate-100'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="px-8 pb-8 pt-16 flex-1 flex flex-col min-h-0">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.4, ease: "circOut" }}
                                    className="flex-1 flex flex-col"
                                >
                                    <div className="text-center mb-10">
                                        <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight px-12">
                                            {stepInfo.question}
                                        </h2>
                                        {currentStep === 0 && (
                                            <p className="text-slate-500 text-lg font-medium mt-3">We'd love to get to know you better.</p>
                                        )}
                                    </div>

                                    <div className={`flex-1 overflow-y-auto px-1 custom-scrollbar pb-6 ${stepInfo.layout === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}`}>
                                        {stepInfo.type === 'input' ? (
                                            <div className="col-span-full flex flex-col items-center justify-center pt-8">
                                                <input
                                                    type="text"
                                                    value={data[stepInfo.id as keyof SurveyData]}
                                                    onChange={(e) => setData({ ...data, [stepInfo.id]: e.target.value })}
                                                    onKeyDown={(e) => e.key === 'Enter' && canContinue && handleNext()}
                                                    autoFocus
                                                    className="w-full h-24 bg-slate-50 border-2 border-transparent rounded-[28px] px-8 text-4xl font-bold text-slate-900 focus:bg-white focus:border-[#0ea5e9] focus:outline-none transition-all placeholder:text-slate-200 text-center shadow-inner"
                                                    placeholder={stepInfo.placeholder}
                                                />
                                            </div>
                                        ) : (
                                            (stepInfo.options as any[])?.map((option) => {
                                                const isSelected = data[stepInfo.id as keyof SurveyData] === option.label;
                                                const isReferral = stepInfo.id === 'referral';
                                                
                                                return (
                                                    <button
                                                        key={option.label}
                                                        onClick={() => handleSelect(option.label)}
                                                        className={`group relative flex ${isReferral ? 'flex-col items-center justify-center text-center p-6' : 'items-center gap-4 p-5'} rounded-[24px] border-2 transition-all duration-300 ${isSelected
                                                            ? 'bg-sky-50 border-[#0ea5e9] shadow-lg shadow-sky-100'
                                                            : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        {option.icon && (
                                                            <div className={`shrink-0 ${isReferral ? 'w-10 h-10 mb-2' : 'w-12 h-12'} rounded-2xl flex items-center justify-center transition-all duration-300 ${isSelected ? 'bg-white' : 'bg-slate-50 group-hover:bg-white'
                                                                }`}>
                                                                <img src={option.icon} alt={option.label} className={`${isReferral ? 'w-6 h-6' : 'w-8 h-8'} object-contain`} />
                                                            </div>
                                                        )}
                                                        <div className={isReferral ? '' : 'text-left'}>
                                                            <div className={`font-bold leading-tight ${isReferral ? 'text-sm' : 'text-lg'} ${isSelected ? 'text-[#0ea5e9]' : 'text-slate-900'}`}>
                                                                {option.label}
                                                            </div>
                                                            {option.description && (
                                                                <div className={`text-sm mt-1.5 font-medium ${isSelected ? 'text-sky-600' : 'text-slate-500'}`}>
                                                                    {option.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {!isReferral && isSelected && (
                                                            <div className="ml-auto bg-[#0ea5e9] text-white p-1 rounded-full">
                                                                <Check size={14} strokeWidth={3} />
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-100">
                                        <button
                                            onClick={handleBack}
                                            disabled={currentStep === 0 || isSubmitting}
                                            className={`flex items-center gap-2 font-bold text-sm transition-all ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-slate-600'
                                                } disabled:opacity-20`}
                                        >
                                            <ArrowLeft size={18} />
                                            Back
                                        </button>

                                        {(stepInfo.type === 'input' || stepInfo.id === 'age') && (
                                            <button
                                                onClick={handleNext}
                                                disabled={!canContinue || isSubmitting}
                                                className="bg-[#0ea5e9] text-white px-10 py-4 rounded-2xl font-bold text-base hover:bg-[#0284c7] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-sky-200/50 disabled:opacity-40 disabled:shadow-none flex items-center gap-2"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 size={18} className="animate-spin" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    currentStep === STEPS.length - 1 ? 'Finish' : 'Continue'
                                                )}
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
