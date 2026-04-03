import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SignIn } from '@clerk/clerk-react';

export const LoginPage = () => {
    return (
        <div className="min-h-screen bg-[#ffffff] font-sans text-slate-900 selection:bg-[#0ea5e9]/10 flex flex-col">
            {/* Background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute inset-0 bg-[#ffffff]" />
                <div
                    className="absolute inset-0 opacity-[0.4]"
                    style={{
                        backgroundImage: `linear-gradient(#f1f5f9 1px, transparent 1px), linear-gradient(90deg, #f1f5f9 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                />
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#0ea5e9]/5 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-indigo-50/5 blur-[100px]" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 md:py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-[440px] flex flex-col items-center"
                >
                    <div className="flex flex-col items-center mb-6 md:mb-10 text-center">
                        <Link to="/" className="text-3xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-2">
                             <div className="w-8 h-8 [filter:brightness(0)_saturate(100%)_invert(58%)_sepia(89%)_saturate(1583%)_hue-rotate(169deg)_brightness(98%)_contrast(93%)]">
                                <img src="/favicon-32x32.png.png" alt="Logo" className="w-full h-full object-contain" />
                             </div>
                             Viszmo
                        </Link>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome back</h1>
                        <p className="text-slate-500 font-medium max-w-[320px]">
                            Sign in to access your study materials and AI help.
                        </p>
                    </div>

                    <div className="w-full flex flex-col items-center gap-6">
                        <div className="w-full transition-transform">
                            <SignIn 
                                routing="path"
                                path="/login"
                                signUpUrl="/signup" 
                                afterSignInUrl="/dashboard"
                                appearance={{
                                    elements: {
                                        rootBox: "w-full",
                                        card: "w-full shadow-none border-none p-0 !bg-transparent",
                                        header: "hidden",
                                        footerAction: "hidden",
                                        formButtonPrimary: "bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold py-3 rounded-xl",
                                        formFieldInput: "bg-slate-50 border-slate-100 rounded-xl",
                                        socialButtonsBlockButton: "border-slate-100 rounded-xl hover:bg-slate-50",
                                        socialButtonsBlockButtonText: "font-semibold text-slate-600"
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100 w-full text-center">
                        <p className="text-sm text-slate-500 font-medium">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-[#0ea5e9] font-bold hover:underline">
                                Create one
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
