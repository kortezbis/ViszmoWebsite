import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useNavigate } from 'react-router-dom';
import { HeroMockup } from './components/HeroMockup';
import { HowItWorks } from './components/HowItWorks';
import { StudentLifeFeatures } from './components/StudentLifeFeatures';
import { Testimonials } from './components/Testimonials';

// SubscriptionModal removed
import { Footer } from './components/Footer';
import { PeelSticker } from './components/PeelSticker';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { OnboardingModal } from './components/OnboardingModal';
import { AuthModal } from './components/AuthModal';
import { DownloadAppModal } from './components/DownloadAppModal';
import { useProfile } from './contexts/ProfileContext';
import { AuthModalProvider, useAuthModal } from './contexts/AuthModalContext';
import DashboardApp from './dashboard/DashboardApp';
import VisDashboard2App from './dashboard/vis-dashboard-2/VisDashboard2App';

import { useAuth, SignedIn, SignedOut, RedirectToSignIn } from './lib/auth';
import { BrowserRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { PublicLayout } from './components/PublicLayout';

// HowItWorksPage import removed as file is missing
import { HowItWorksPage } from './pages/HowItWorksPage';
import { PricingPage } from './pages/PricingPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { StudyOverlayPage } from './pages/StudyOverlayPage';


import { AccountPage } from './pages/AccountPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { ContactUsPage } from './pages/ContactUsPage';
import { HelpCenterPage } from './pages/HelpCenterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';


// List of school logo filenames
const SCHOOL_LOGOS = [
  'Harvard.png',
  'MIT.png',
  'Symbol.png',
  'UC.png',
  'UT Austin.png',
  'Texas A&M.png',
  'Alabama.png',
  'ASU.webp',
  'Duke.png',
  'Florida Gators.png',
  'Georgetown.png',
  'Indiana.png',
  'Kent State.png',
  'LSU.png',
  'North.png',
  'NYU.png',
  'Ohio State.png',
  'Oregon.png',
  'Penn State.png',
  'Stanford Icon.png',
  'Stanford.png',
  'UCLA.png',
  'University of Miami.png',
  'University of Houston.png',
  'WGU.png',
  'iowa.png',
  'Auburn.webp',
  'USC.svg',
  'Boston University.png',
  'Brown University.png',
  'FSU.svg',
  'Princeton.png',
];



const STICKER_POSITIONS = [
  // Top / Near Header - Bigger & Closer to Text
  { top: '18%', left: '12%', rotate: '-12deg', scale: 1.2 },
  { top: '22%', right: '12%', rotate: '12deg', scale: 1.2 },

  // Mid-Upper - Filling gaps near Navbar/Hero Text
  { top: '35%', left: '8%', rotate: '8deg', scale: 1.0 },
  { top: '38%', right: '8%', rotate: '-8deg', scale: 1.0 },

  // Mid-Lower - Edges
  { top: '55%', left: '4%', rotate: '-15deg', scale: 0.9 },
  { top: '60%', right: '6%', rotate: '15deg', scale: 0.9 },

  // Bottom - Far Edges
  { top: '78%', left: '5%', rotate: '-5deg', scale: 0.8 },
  { top: '82%', right: '5%', rotate: '5deg', scale: 0.8 },
];

const STICKER_POSITIONS_MOBILE = [
  // Top Left (Small & High - Under Navbar area)
  { top: '4%', left: '-2%', rotate: '-10deg', scale: 0.4 },

  // Top Right (Small & High - Under Navbar area)
  { top: '6%', right: '-2%', rotate: '10deg', scale: 0.4 },

  // Bottom Left (Small & Low)
  { top: '85%', left: '5%', rotate: '-5deg', scale: 0.4 },
];

function LandingPage({ onOpenDownload, onOpenAuth }: { onOpenDownload: () => void, onOpenAuth: (view: 'login' | 'signup') => void }) {
    const { isSignedIn } = useAuth();
    const navigate = useNavigate();


  const [loadedSchoolLogos, setLoadedSchoolLogos] = useState<string[]>([]);
  const [activeStickers, setActiveStickers] = useState<{ logo: string; position: any; id: string }[]>([]);
  const heroSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Load school logos
    const schoolPaths = SCHOOL_LOGOS.map(logo => `/Schools/${logo}`);

    const preloadImages = (paths: string[]) => {
      return Promise.all(paths.map((src) => {
        return new Promise<string>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(src);
          img.onerror = () => resolve('');
          img.src = src;
        });
      }));
    };

    preloadImages(schoolPaths).then((results) => {
      const valid = results.filter((src) => src !== '');
      setLoadedSchoolLogos(valid);
    });
  }, []);

  useEffect(() => {
    if (loadedSchoolLogos.length === 0) return;

    let availableSchools = [...loadedSchoolLogos];

    const shuffle = (array: string[]) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    // Initial shuffles
    availableSchools = shuffle(availableSchools);

    let schoolIndex = 0;

    const showNextBatch = () => {
      const isMobile = window.innerWidth < 1024; // lg breakpoint match
      const currentPositions = isMobile ? STICKER_POSITIONS_MOBILE : STICKER_POSITIONS;
      const nextBatchLogos: string[] = [];

      const numPositions = currentPositions.length;

      // Fill school logos
      for (let i = 0; i < numPositions; i++) {
        if (loadedSchoolLogos.length === 0) break;

        let attempts = 0;
        let candidate = '';

        while (attempts < 20) {
          if (schoolIndex >= availableSchools.length) {
            availableSchools = shuffle(loadedSchoolLogos);
            schoolIndex = 0;
          }
          candidate = availableSchools[schoolIndex];
          if (!nextBatchLogos.includes(candidate)) {
            nextBatchLogos.push(candidate);
            schoolIndex++;
            break;
          }
          schoolIndex++;
          attempts++;
        }
      }

      // Shuffle the batch
      const randomizedBatch = shuffle(nextBatchLogos);

      // Create and set stickers
      const newStickers = randomizedBatch.map((logo, idx) => ({
        logo,
        position: currentPositions[idx],
        id: `${logo}-${Date.now()}-${idx}`
      }));

      setActiveStickers(newStickers);
    };

    // Start first batch immediately
    showNextBatch();

    const intervalId = setInterval(() => {
      // 1. Clear stickers (triggers Exit animation)
      setActiveStickers([]);

      // 2. Wait for exit animation to complete (approx 2s + staggering)
      setTimeout(() => {
        showNextBatch();
      }, 2500); // 2.5s wait (covers the 2s exit duration)

    }, 8000); // Process repeats every 8s (6s visible + 2s transition approx)

    return () => clearInterval(intervalId);
  }, [loadedSchoolLogos]);



  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative min-h-screen font-sans overflow-x-hidden bg-white text-slate-900"
      style={{
        backgroundColor: '#ffffff',
        minHeight: '100vh',
        width: '100%'
      }}
    >
      {/* LandingPage Content */}




      {/* Cluely-Inspired Hero Section */}
      <section ref={heroSectionRef} className="pt-32 md:pt-48 pb-12 md:pb-24 px-4 text-center relative z-10 overflow-hidden min-h-[auto] lg:min-h-screen flex flex-col items-center">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/hero-background.jpg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Subtle overlay for better text readability - Only on top portion for text */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-white/20 via-white/10 to-transparent pointer-events-none" />

        {/* School Stickers on Background - Above background and overlay */}
        <div className="absolute inset-0 z-5 overflow-visible pointer-events-none" style={{ overflow: 'visible' }}>
          <AnimatePresence mode="wait">
            {activeStickers.map((sticker, idx) => (
              <PeelSticker
                key={sticker.id}
                logoUrl={sticker.logo}
                alt="School Logo"
                index={idx}
                delay={0.5 + idx * 0.15}
                style={{
                  ...sticker.position,
                  width: '260px',
                  height: '260px',
                  transform: `scale(${sticker.position.scale || 1})`,
                  overflow: 'visible'
                }}
              />
            ))}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-5xl mx-auto flex flex-col items-center relative z-10"
        >
          {/* Stats Badge for "Breakdown" */}
          <div className="mb-8 scale-95 md:scale-100">
            <div className="trusted-pill-wrap">
              <div className="trusted-pill-shadow"></div>
              <div className="trusted-pill hero-pill">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0ea5e9] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0ea5e9]"></span>
                </span>
                <span className="font-medium text-sm tracking-wide text-slate-900">Trusted by 200,000+ Students</span>
              </div>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 md:mb-8 leading-[1.1] px-2 text-white">
            Your live study <br />
            <span className="invisible-pill-wrap mx-1 sm:mx-2">
              <span className="invisible-pill-shadow"></span>
              <span className="invisible-pill-content">
                <span className="invisible-pill-shiny"></span>
                <span className="relative z-10 text-[#0ea5e9] font-bold">Sidekick</span>
              </span>
            </span>
          </h1>

          {/* Divider Line */}
          <div className="w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-6 md:mb-8"></div>

          <p className="text-base md:text-lg text-white/90 mb-8 md:mb-10 max-w-3xl mx-auto leading-relaxed font-normal px-4">
            Viszmo lives on your screen to provide instant AI assistance and perfect notes while you study—all seamlessly synced to an advanced <span className="font-bold text-white">Study Dashboard</span> for your flashcards, quizzes, and personalized guides.
          </p>

          {/* Get for Windows Button - Centered */}
          <div className="btn-wrapper">
            <button className="btn" onClick={() => isSignedIn ? navigate('/dashboard') : onOpenAuth('signup')}>
              <svg className="btn-svg" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 30 30" fill="currentColor">
                <path d="M4 4H14V14H4zM16 4H26V14H16zM4 16H14V26H4zM16 16H26V26H16z"></path>
              </svg>
              <span className="btn-text">{isSignedIn ? 'Go to Dashboard' : 'Get Started Free'}</span>
            </button>
          </div>

          {/* Test Score Stickers - Consolidated */}
          <div className="mt-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 flex flex-wrap justify-center gap-4">
            {/* Test Scores */}
            <div className="bg-white p-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 transform -rotate-1 hover:rotate-0 transition-transform duration-300 cursor-default inline-flex">
              <div className="flex items-center divide-x divide-slate-100">
                {[
                  { label: 'SAT', score: '1580' },
                  { label: 'ACT', score: '34' },
                  { label: 'LSAT', score: '178' },
                  { label: 'MCAT', score: '524' },
                  { label: 'GRE', score: '338' },
                ].map((item, index) => (
                  <div key={index} className="px-3 sm:px-4 flex flex-col items-center first:pl-2 last:pr-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-tight mb-0.5">{item.label}</span>
                    <span className="text-sm sm:text-base font-black text-slate-900 leading-none">{item.score}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>



        </motion.div>

        {/* Hero Mockup - now outside the narrow text container for full width */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="mt-12 md:mt-16 relative w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8 z-10"
        >
          {/* Glow effect behind the mockup */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[1200px] bg-indigo-500/10 blur-[120px] -z-10 rounded-full" />
          <HeroMockup />
        </motion.div>
      </section>





      {/* Feature Highlights - Merged Bento Grid with Exam Software Showcase */}
      <StudentLifeFeatures />




      {/* Feature Cards Section */}
      <section className="py-24 md:py-32 px-4 bg-transparent relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Section Header - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-16 md:mb-20 items-start">
            {/* Left: Main Title */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                One platform to learn faster{' '}
                <span
                  className="relative inline-block text-white px-4 py-1 transform -skew-x-6 mx-2 shadow-lg overflow-hidden"
                  style={{
                    background: 'linear-gradient(90deg, #0ea5e9, #0aa883, #8b5cf6, #0ea5e9, #0aa883)',
                    backgroundSize: '200% 100%',
                    animation: 'gradient-flow 8s ease-in-out infinite'
                  }}
                >
                  <span className="block transform skew-x-6 relative z-10">and retain longer</span>
                </span>
              </h2>
              <style>{`
                  @keyframes gradient-flow {
                    0%, 100% {
                      background-position: 0% 50%;
                    }
                    50% {
                      background-position: 100% 50%;
                    }
                  }
                `}</style>
            </motion.div>

            {/* Right: Description */}
            <motion.div
              className="lg:pt-2"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
              <p className="text-base md:text-lg text-slate-600 leading-relaxed">
                Transform any content into interactive study materials, master subjects with AI-powered spaced repetition, and track your progress—all from one powerful dashboard designed for serious students.
              </p>
            </motion.div>
          </div>

          {/* Two Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 transition-all duration-500">
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
              className="group bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-slate-200/60 hover:border-slate-300/80 hover:shadow-xl transition-all duration-300"
            >
              {/* Study Mode Pills */}
              <div className="w-full min-h-[224px] mb-6 flex flex-wrap gap-2 p-4 sm:p-6 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-[1.02]">
                <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-100/50 rounded-full liquid-glass-pill transition-all duration-300 group-hover:scale-105">
                  <img src="/dashimages/flashcard.png.png" alt="Flashcards" className="w-5 h-5 object-contain" />
                  <span className="text-sm font-bold text-slate-700">Flashcards</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-100/50 rounded-full liquid-glass-pill transition-all duration-300 group-hover:scale-105">
                  <img src="/dashimages/puzzle.png.png" alt="Matching" className="w-5 h-5 object-contain" />
                  <span className="text-sm font-bold text-slate-700">Matching</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-100/50 rounded-full liquid-glass-pill transition-all duration-300 group-hover:scale-105">
                  <img src="/dashimages/hotdeal.png.png" alt="Rapid-Fire" className="w-5 h-5 object-contain" />
                  <span className="text-sm font-bold text-slate-700">Rapid-Fire</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-100/50 rounded-full liquid-glass-pill transition-all duration-300 group-hover:scale-105">
                  <img src="/dashimages/speech.png.png" alt="Speaking" className="w-5 h-5 object-contain" />
                  <span className="text-sm font-bold text-slate-700">Speaking</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-100/50 rounded-full liquid-glass-pill transition-all duration-300 group-hover:scale-105">
                  <img src="/dashimages/writing.png.png" alt="Written" className="w-5 h-5 object-contain" />
                  <span className="text-sm font-bold text-slate-700">Written</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-100/50 rounded-full liquid-glass-pill transition-all duration-300 group-hover:scale-105">
                  <img src="/dashimages/test.png.png" alt="Practice Tests" className="w-5 h-5 object-contain" />
                  <span className="text-sm font-bold text-slate-700">Practice Tests</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-100/50 rounded-full liquid-glass-pill transition-all duration-300 group-hover:scale-105">
                  <img src="/dashimages/guide.png.png" alt="Learn" className="w-5 h-5 object-contain" />
                  <span className="text-sm font-bold text-slate-700">Learn Mastery</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-pink-100/50 rounded-full liquid-glass-pill transition-all duration-300 group-hover:scale-105">
                  <img src="/dashimages/card-games.png.png" alt="Spaced Repetition" className="w-5 h-5 object-contain" />
                  <span className="text-sm font-bold text-slate-700">Spaced Repetition</span>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100/50 rounded-full liquid-glass-pill border border-dashed border-slate-300 transition-all duration-300 group-hover:scale-105">
                  <div className="w-5 h-5 flex items-center justify-center bg-slate-200/50 rounded-full overflow-hidden">
                    <img src="/dashimages/plus.png.png" alt="More" className="w-2 h-2 object-contain" />
                  </div>
                  <span className="text-sm font-bold text-slate-500">and much more...</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                Smart Study Modes
              </h3>

              {/* Description */}
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                8 interactive modes: Flashcards, Match Game, Rapid-Fire, Speaking, Written, Tests, and more. Adaptive AI prioritizes cards you need to review.
              </p>

              {/* CTA Link */}
              <a
                href="#"
                className="inline-flex items-center gap-2 text-[#0ea5e9] font-semibold text-sm group-hover:gap-3 transition-all duration-300"
              >
                Learn more
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border border-slate-200/60 hover:border-slate-300/80 hover:shadow-xl transition-all duration-300"
            >
              {/* Upload Visualization */}
              <div className="w-full min-h-[224px] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl mb-6 flex flex-col items-center justify-center p-8 border-2 border-dashed border-blue-200 hover:border-blue-400 transition-all duration-300 group-hover:scale-[1.02]">
                {/* Upload Icon */}
                <div className="mb-4 w-20 h-20 shrink-0 aspect-square flex items-center justify-center rounded-full liquid-glass-pill">
                  <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>

                {/* Upload Text */}
                <p className="text-base font-semibold text-slate-700 mb-3">Drop files or click to upload</p>

                {/* File Type Icons */}
                <div className="flex items-center gap-4 mt-2">
                  <img src="/dashimages/pdf-document.png.png" alt="PDF" className="w-10 h-10 object-contain hover:scale-110 transition-transform duration-200" />
                  <img src="/dashimages/doc.png.png" alt="DOCX" className="w-10 h-10 object-contain hover:scale-110 transition-transform duration-200" />
                  <img src="/dashimages/txt.png.png" alt="TXT" className="w-10 h-10 object-contain hover:scale-110 transition-transform duration-200" />
                  <img src="/dashimages/mp3.png.png" alt="Audio" className="w-10 h-10 object-contain hover:scale-110 transition-transform duration-200" />
                  <img src="/dashimages/youtube.png.png" alt="Video" className="w-10 h-10 object-contain hover:scale-110 transition-transform duration-200" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                AI-Powered Content Generation
              </h3>

              {/* Description */}
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Upload PDFs, paste notes, or use transcripts to instantly generate flashcards and quizzes. Your study materials create themselves.
              </p>

              {/* CTA Link */}
              <a
                href="#"
                className="inline-flex items-center gap-2 text-[#0ea5e9] font-semibold text-sm group-hover:gap-3 transition-all duration-300"
              >
                Learn more
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works - "3 Steps" with Grid Background */}
      <div className="relative isolate">
        {/* Grid Background Pattern */}
        <div
          className="absolute inset-0 -z-20 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 95%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 95%, transparent 100%)'
          }}
        />
        <HowItWorks />
      </div>




      {/* Shared Background Wrapper for Testimonials & CTA */}
      <div className="relative isolate">
        {/* Continuous Grid Background with Vertical Fade */}
        <div
          className="absolute inset-0 -z-20 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 95%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 95%, transparent 100%)'
          }}
        />

        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-b from-transparent to-[#d6dee8] -z-10 pointer-events-none" />

        {/* Testimonials - Social Proof */}
        <Testimonials />

        {/* Study or Never Study Again CTA Section */}
        <section className="py-24 md:py-32 px-4 relative z-10 bg-transparent">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 tracking-tight px-4 text-slate-900"
            >
              Ready to ace <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0ea5e9] to-indigo-400">every exam?</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-base md:text-lg text-slate-500 mb-10 md:mb-8 max-w-2xl mx-auto leading-relaxed px-4"
            >
              Join thousands of students using Viszmo to crush their coursework. Sign up now and be the first to know when we release.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="btn-wrapper">
                  <button
                    className="btn"
                    onClick={() => navigate('/dashboard')}
                  >
                    <span className="btn-text">Get Started</span>
                  </button>
                </div>

                <div className="explore-btn-wrap" onClick={() => navigate('/pricing')}>
                  <div className="explore-btn-shadow"></div>
                  <button className="explore-btn">
                    <span>Explore Pricing</span>
                  </button>
                </div>
              </div>

              <p className="text-[10px] md:text-xs font-bold text-slate-400 tracking-widest uppercase">
                WINDOWS 10 & 11 • SAFE
              </p>
            </motion.div>
          </div>
        </section>

      </div>


      {/* Subscription Modal */}

    </motion.div>
  );
}

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const AuthRedirect = ({ view }: { view: 'login' | 'signup' }) => {
  const { openAuthModal } = useAuthModal();
  const navigate = useNavigate();
  useEffect(() => {
    openAuthModal(view);
    navigate('/', { replace: true });
  }, [view, openAuthModal, navigate]);
  return null;
};

function AnimatedRoutes({ onOpenDownload }: { onOpenDownload: () => void }) {
  const location = useLocation();
  const { showSurvey, setShowSurvey } = useProfile();
  const { openAuthModal } = useAuthModal();

  const publicPaths = ['/', '/features', '/pricing', '/how-it-works', '/study-overlay', '/terms', '/privacy', '/contact', '/help', '/account', '/login', '/signup'];
  const isPublicPath = publicPaths.includes(location.pathname) || location.pathname.startsWith('/login') || location.pathname.startsWith('/signup');

  const routes = (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage onOpenDownload={onOpenDownload} onOpenAuth={openAuthModal} />} />
        <Route path="/features" element={<FeaturesPage onOpenDownload={onOpenDownload} />} />
        <Route path="/pricing" element={<PricingPage onOpenDownload={onOpenDownload} />} />
        <Route path="/how-it-works" element={<HowItWorksPage onOpenDownload={onOpenDownload} />} />
        <Route path="/study-overlay" element={<StudyOverlayPage />} />

        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/account" element={
          <>
            <SignedIn>
              <AccountPage onOpenDownload={onOpenDownload} />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn afterSignInUrl="/account" />
            </SignedOut>
          </>
        } />

        {/* Independent Routes redirected to modal */}
        <Route path="/login/*" element={<AuthRedirect view="login" />} />
        <Route path="/signup/*" element={<AuthRedirect view="signup" />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route path="/dashboard/*" element={
          <>
            <SignedIn>
              <DashboardApp />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn afterSignInUrl="/dashboard" />
            </SignedOut>
          </>
        } />

        {/* New dashboard workspace (separate layout + routes) */}
        <Route path="/dashboard-v2/*" element={
          <>
            <SignedIn>
              <VisDashboard2App />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn afterSignInUrl="/dashboard-v2" />
            </SignedOut>
          </>
        } />
      </Routes>
    </AnimatePresence>
  );

  return (
    <>
      {isPublicPath ? (
        <PublicLayout onOpenDownload={onOpenDownload} onOpenAuth={openAuthModal}>
          {routes}
        </PublicLayout>
      ) : (
        routes
      )}
      

      <OnboardingModal isOpen={showSurvey} onComplete={() => setShowSurvey(false)} />
    </>
  );
}

export default function App() {
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const { isOpen, view, closeAuthModal } = useAuthModal();

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AnimatedRoutes 
        onOpenDownload={() => setShowDownloadModal(true)} 
      />
      <DownloadAppModal isOpen={showDownloadModal} onClose={() => setShowDownloadModal(false)} />
      <AuthModal 
        isOpen={isOpen} 
        initialView={view} 
        onClose={closeAuthModal} 
      />
    </BrowserRouter>
  );
}
