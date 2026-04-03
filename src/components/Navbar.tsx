import { useState } from 'react';
import { Menu, X as XIcon, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';
import { useClerkSession, UserButton } from '../lib/clerk';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
    onOpenModal?: () => void;
    onTestSurvey?: () => void;
}

export const Navbar = ({ onOpenModal = () => { }, onTestSurvey }: NavbarProps) => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isSignedIn } = useClerkSession();
    const [showExploreMenu, setShowExploreMenu] = useState(false);

    const handleSignIn = () => {
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-4 md:pt-6 px-4" style={{ position: 'fixed', top: 0, left: 0, right: 0 }}>
            <div className="glass-navbar w-[95%] md:w-full max-w-7xl mx-auto flex md:grid md:grid-cols-3 gap-8 items-center justify-between px-6 md:px-10 py-3 md:py-4 rounded-full">
                <a href="/" className="flex items-center justify-center transition-all hover:opacity-80 relative z-10 justify-self-start py-1">
                    <div className="[filter:brightness(0)_saturate(100%)_invert(58%)_sepia(89%)_saturate(1583%)_hue-rotate(169deg)_brightness(98%)_contrast(93%)]">
                        <Logo size={28} variant="full" />
                    </div>
                </a>
                <div className="hidden md:flex items-center gap-7 text-sm font-medium text-[#0ea5e9] relative z-10 justify-self-center">
                    <button
                        onClick={onOpenModal}
                        className="hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-1.5"
                    >
                        <span>Download App</span>
                    </button>

                    {/* Explore Dropdown */}
                    <div className="relative group">
                        <button
                            onMouseEnter={() => setShowExploreMenu(true)}
                            onMouseLeave={() => setShowExploreMenu(false)}
                            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity cursor-pointer h-10"
                        >
                            <span>Explore</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showExploreMenu ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {showExploreMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
                                    animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
                                    onMouseEnter={() => setShowExploreMenu(true)}
                                    onMouseLeave={() => setShowExploreMenu(false)}
                                    className="absolute top-full left-1/2 mt-1 w-44 glass-element rounded-[1.5rem] overflow-hidden p-2 shadow-xl"
                                >
                                    <div className="flex flex-col gap-1">
                                        <a href="/features" className="px-3 py-2 hover:bg-white/40 rounded-xl transition-colors text-slate-700">
                                            Features
                                        </a>
                                        <a href="/how-it-works" className="px-3 py-2 hover:bg-white/40 rounded-xl transition-colors text-slate-700">
                                            How It Works
                                        </a>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <a href="/pricing" className="hover:opacity-80 transition-opacity">Pricing</a>

                    {onTestSurvey && (
                        <button onClick={onTestSurvey} className="hover:opacity-80 transition-opacity text-amber-500 font-bold">
                            Test Survey
                        </button>
                    )}
                </div>

                <div className="hidden md:flex items-center gap-6 relative z-10 justify-self-end">

                    {isSignedIn ? (
                        <div className="flex items-center gap-3">
                            <a 
                                href="/dashboard" 
                                className="text-sm font-bold text-slate-700 hover:text-[#0ea5e9] transition-colors"
                            >
                                Dashboard
                            </a>
                            <UserButton 
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        userButtonAvatarBox: "w-9 h-9 border-2 border-white shadow-sm hover:scale-105 transition-transform",
                                        userButtonPopoverCard: "rounded-2xl border border-slate-200 shadow-xl",
                                        userButtonPopoverActionButton: "hover:bg-slate-50 transition-colors",
                                        userButtonPopoverActionButtonText: "font-semibold text-slate-600",
                                        userButtonPopoverFooter: "hidden"
                                    }
                                }}
                            />
                        </div>
                    ) : (
                        <button
                            onClick={handleSignIn}
                            className="text-sm font-bold text-[#0ea5e9] hover:opacity-80 transition-opacity"
                        >
                            Sign in
                        </button>
                    )}

                    <div className="btn-wrapper" onClick={onOpenModal}>
                        <button className="btn btn-sm">
                            <svg className="btn-svg" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 30 30" fill="currentColor">
                                <path d="M4 4H14V14H4zM16 4H26V14H16zM4 16H14V26H4zM16 16H26V26H16z"></path>
                            </svg>
                            <span className="btn-text">Get for Windows</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden w-9 h-9 rounded-full bg-white/50 border border-white/30 backdrop-blur-sm flex items-center justify-center hover:bg-white/70 transition-all"
                    aria-label="Menu"
                >
                    {isMobileMenuOpen ? (
                        <XIcon className="w-4 h-4 text-gray-900" />
                    ) : (
                        <Menu className="w-4 h-4 text-gray-900" />
                    )}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 top-0"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="md:hidden fixed top-[72px] left-4 right-4 z-50 rounded-2xl backdrop-blur-xl bg-white/95 border border-slate-200 shadow-2xl p-5"
                        >
                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={() => {
                                        onOpenModal();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="text-sm font-bold text-slate-900 px-2 py-3 border-b border-slate-100 flex items-center justify-between text-left w-full cursor-pointer"
                                >
                                    <span>Download App</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9]/20" />
                                </button>

                                <div className="mt-2 mb-1 px-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Explore</span>
                                </div>
                                <a href="/features" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-slate-900 px-2 py-3 border-b border-slate-100">Features</a>
                                <a href="/how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-slate-900 px-2 py-3 border-b border-slate-100">How It Works</a>
                                <a href="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-slate-900 px-2 py-3 border-b border-slate-100">Pricing</a>


                                <div className="flex flex-col gap-3 mt-4">
                                    <button
                                        onClick={() => {
                                            handleSignIn();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full py-4 text-sm font-bold text-[#0ea5e9] bg-blue-50/50 rounded-2xl border border-blue-100/50"
                                    >
                                        Sign in
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            onOpenModal();
                                        }}
                                        className="btn w-full py-4"
                                    >
                                        <svg className="btn-svg" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 30 30" fill="currentColor">
                                            <path d="M4 4H14V14H4zM16 4H26V14H16zM4 16H14V26H4zM16 16H26V26H16z"></path>
                                        </svg>
                                        <span className="btn-text">Get for Windows</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    );
};
