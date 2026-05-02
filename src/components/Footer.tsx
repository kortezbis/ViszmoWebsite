
import { Logo } from './Logo';
import { Link } from 'react-router-dom';

interface FooterProps {
    onOpenModal?: () => void;
}

export const Footer = ({ onOpenModal = () => { } }: FooterProps) => {
    const currentYear = 2026; // As requested by user

    return (
        <footer className="bg-[#d6dee8] pt-16 pb-12 relative z-10 -mt-px">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
                    {/* Brand Column - Wider on desktop */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <Link to="/" className="flex items-center gap-3">
                            <Logo size={32} variant="full" className="brightness-0 opacity-90" />
                        </Link>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                            Your live study sidekick. Viszmo adapts to how you learn, providing instant assistance and perfect notes without breaking your flow.
                        </p>

                        {/* Social Icons */}
                        {/* Social Icons - Bold Filled Style */}
                        <div className="flex items-center gap-5 mt-2">
                            <a href="https://www.instagram.com/viszmo.ai" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#E4405F] transition-colors duration-300 transform hover:scale-110" aria-label="Instagram">
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                            <a href="https://www.tiktok.com/@viszmostudy" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-black transition-colors duration-300 transform hover:scale-110" aria-label="TikTok">
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                </svg>
                            </a>
                            <a href="https://www.facebook.com/people/Viszmo/61572037655549/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#1877F2] transition-colors duration-300 transform hover:scale-110" aria-label="Facebook">
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                            <a href="https://www.youtube.com/@viszmo" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#FF0000] transition-colors duration-300 transform hover:scale-110" aria-label="YouTube">
                                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Links Grid */}
                    <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-8">
                        {/* Column 1 */}
                        <div className="flex flex-col gap-4">
                            <h4 className="font-semibold text-slate-900">Platform</h4>
                            <ul className="flex flex-col gap-3 text-sm text-slate-500">
                                <li><button onClick={onOpenModal} className="hover:text-[#0ea5e9] transition-colors text-left">Download Mobile App</button></li>
                                <li><span className="text-slate-400 cursor-not-allowed">Download Windows</span></li>
                                <li>
                                    <span className="text-slate-400 cursor-not-allowed flex items-center gap-2">
                                        Download Mac <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">Soon</span>
                                    </span>
                                </li>
                            </ul>
                        </div>

                        {/* Column 2 */}
                        <div className="flex flex-col gap-4">
                            <h4 className="font-semibold text-slate-900">Resources</h4>
                            <ul className="flex flex-col gap-3 text-sm text-slate-500">
                                <li><Link to="/help" className="hover:text-[#0ea5e9] transition-colors">Help Center</Link></li>
                                <li><Link to="/pricing" className="hover:text-[#0ea5e9] transition-colors">Pricing</Link></li>
                                <li><Link to="/features" className="hover:text-[#0ea5e9] transition-colors">Features</Link></li>
                                <li><Link to="/how-it-works" className="hover:text-[#0ea5e9] transition-colors">How It Works</Link></li>

                            </ul>
                        </div>

                        {/* Column 3 */}
                        <div className="flex flex-col gap-4">
                            <h4 className="font-semibold text-slate-900">Alternatives</h4>
                            <ul className="flex flex-col gap-3 text-sm text-slate-500">
                                <li><a href="#" className="hover:text-[#0ea5e9] transition-colors">Chegg Alt</a></li>
                                <li><a href="#" className="hover:text-[#0ea5e9] transition-colors">Quizlet Alt</a></li>
                                <li><a href="#" className="hover:text-[#0ea5e9] transition-colors">CourseHero Alt</a></li>
                                <li><a href="#" className="hover:text-[#0ea5e9] transition-colors">Brainly Alt</a></li>
                            </ul>
                        </div>

                        {/* Column 4 */}
                        <div className="flex flex-col gap-4">
                            <h4 className="font-semibold text-slate-900">Legal</h4>
                            <ul className="flex flex-col gap-3 text-sm text-slate-500">
                                <li><Link to="/privacy" className="hover:text-[#0ea5e9] transition-colors">Privacy Policy</Link></li>
                                <li><Link to="/terms" className="hover:text-[#0ea5e9] transition-colors">Terms of Service</Link></li>
                                <li><Link to="/contact" className="hover:text-[#0ea5e9] transition-colors">Contact Support</Link></li>
                                <li><a href="mailto:support@Viszmo.com" className="hover:text-[#0ea5e9] transition-colors">support@Viszmo.com</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-sm">
                        © {currentYear} Viszmo AI. All rights reserved.
                    </p>

                    <div className="flex items-center gap-6">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs font-medium text-slate-500">Systems Operational</span>
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};
