import { useState } from 'react';
import { Menu, X as XIcon, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';
import { useAuth, UserButton } from '../lib/auth';
import { useNavigate, Link } from 'react-router-dom';
import { usePreviewMode } from '../contexts/PreviewModeContext';
import { PlatformDownloadIcon } from './PlatformDownloadIcons';
import { useDesktopDownloadLabel } from './DownloadCtaButton';

interface NavbarProps {
    onOpenModal?: () => void;
    onOpenMobileModal?: () => void;
    onOpenAuth?: (view: 'login' | 'signup') => void;
}

export const Navbar = ({ onOpenModal = () => { }, onOpenMobileModal = () => { }, onOpenAuth = () => { } }: NavbarProps) => {
    const navigate = useNavigate();
    const { isApplePlatform } = usePreviewMode();
    const downloadLabel = useDesktopDownloadLabel('download-now');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isSignedIn } = useAuth();
    const [showExploreMenu, setShowExploreMenu] = useState(false);

    const handleSignIn = () => {
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-4 md:pt-6 px-4" style={{ position: 'fixed', top: 0, left: 0, right: 0 }}>
            <div className="glass-navbar w-[95%] md:w-full max-w-7xl mx-auto flex md:grid md:grid-cols-3 gap-8 items-center justify-between px-6 md:px-10 py-3 md:py-4 rounded-full">
                <Link to="/" className="flex items-center justify-center transition-all hover:opacity-80 relative z-10 justify-self-start py-1">
                    <div className="[filter:brightness(0)_saturate(100%)_invert(58%)_sepia(89%)_saturate(1583%)_hue-rotate(169deg)_brightness(98%)_contrast(93%)]">
                        <Logo size={28} variant="full" />
                    </div>
                </Link>
                <div className="hidden md:flex items-center gap-7 text-sm font-medium text-[#0ea5e9] relative z-10 justify-self-center">
                    <button
                        className="hover:opacity-80 transition-opacity flex items-center gap-1.5"
                        onClick={() => navigate('/dashboard')}
                    >
                        <span>Dashboard</span>
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
                                        <button onClick={() => { onOpenMobileModal(); setShowExploreMenu(false); }} className="px-3 py-2 hover:bg-white/40 rounded-xl transition-colors text-slate-700 text-left w-full">
                                            Mobile App
                                        </button>
                                        <Link to="/features" className="px-3 py-2 hover:bg-white/40 rounded-xl transition-colors text-slate-700">
                                            Features
                                        </Link>
                                        <Link to="/how-it-works" className="px-3 py-2 hover:bg-white/40 rounded-xl transition-colors text-slate-700">
                                            How It Works
                                        </Link>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <Link to="/pricing" className="hover:opacity-80 transition-opacity">Pricing</Link>

                </div>

                <div className="hidden md:flex items-center gap-6 relative z-10 justify-self-end">

                    {isSignedIn ? (
                        <div className="flex items-center gap-3">

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
                            onClick={() => onOpenAuth('login')}
                            className="text-sm font-bold text-[#0ea5e9] hover:opacity-80 transition-opacity"
                        >
                            Sign in
                        </button>
                    )}

                    <div className="btn-wrapper">
                        <button className="btn btn-sm" onClick={onOpenModal}>
                            <PlatformDownloadIcon
                                isApple={isApplePlatform}
                                className="w-4 h-4 mr-2 shrink-0"
                                size={16}
                            />
                            <span className="btn-text">{downloadLabel}</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden flex items-center justify-center transition-opacity hover:opacity-70 text-[#0ea5e9]"
                    aria-label="Menu"
                >
                    {isMobileMenuOpen ? (
                        <XIcon className="w-4 h-4" />
                    ) : (
                        <Menu className="w-4 h-4" />
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
                                        navigate('/dashboard');
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="text-sm font-bold text-slate-900 px-2 py-3 border-b border-slate-100 flex items-center justify-between text-left w-full cursor-pointer"
                                >
                                    <span>Dashboard</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#0ea5e9]/20" />
                                </button>

                                <div className="mt-2 mb-1 px-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Explore</span>
                                </div>
                                <button onClick={() => { onOpenMobileModal(); setIsMobileMenuOpen(false); }} className="text-sm font-bold text-slate-900 px-2 py-3 border-b border-slate-100 text-left w-full">Mobile App</button>
                                <Link to="/features" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-slate-900 px-2 py-3 border-b border-slate-100">Features</Link>
                                <Link to="/how-it-works" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-slate-900 px-2 py-3 border-b border-slate-100">How It Works</Link>
                                <Link to="/pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-slate-900 px-2 py-3 border-b border-slate-100">Pricing</Link>
                                


                                <div className="flex flex-col gap-3 mt-4">
                                    {!isSignedIn && (
                                        <button
                                            onClick={() => {
                                                onOpenAuth('login');
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="w-full py-4 text-sm font-bold text-[#0ea5e9] bg-blue-50/50 rounded-2xl border border-blue-100/50"
                                        >
                                            Sign in
                                        </button>
                                    )}
                                    <button
                                        className="btn w-full py-4"
                                        onClick={() => {
                                            navigate('/dashboard');
                                            setIsMobileMenuOpen(false);
                                        }}
                                    >
                                        <PlatformDownloadIcon isApple={isApplePlatform} className="btn-svg" />
                                        <span className="btn-text">Dashboard</span>
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
