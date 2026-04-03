import { useState } from 'react';
import {
    X,
    Settings,
    Volume2,
    ChevronDown,
    Zap,
    Puzzle,
    PenTool,
    Mic,
    ClipboardCheck,
    Layers,
    HelpCircle,
    Home
} from 'lucide-react';
import { Link } from 'react-router-dom';

const GAME_MODES = [
    { name: 'Flashcards', icon: Layers, color: 'text-blue-400' },
    { name: 'Learn', icon: Zap, color: 'text-yellow-400' },
    { name: 'Match', icon: Puzzle, color: 'text-green-400' },
    { name: 'Written', icon: PenTool, color: 'text-purple-400' },
    { name: 'Speaking', icon: Mic, color: 'text-red-400' },
    { name: 'Test', icon: ClipboardCheck, color: 'text-orange-400' },
];

export default function MatchGame() {
    const [isMuted, setIsMuted] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedMode, setSelectedMode] = useState(GAME_MODES[2]); // Default to Match

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col" onClick={() => setIsDropdownOpen(false)}>
            {/* Header */}
            <header className="px-6 py-4 flex items-center justify-between relative z-50">
                {/* Left: Module Dropdown */}
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsDropdownOpen((prev) => !prev);
                        }}
                        className="flex items-center gap-2 cursor-pointer hover:bg-white/10 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-white/10"
                    >
                        <selectedMode.icon className={`w-5 h-5 ${selectedMode.color}`} />
                        <span className="font-semibold">{selectedMode.name}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-[#1e293b] border border-gray-700 rounded-xl shadow-xl z-50 animate-fade-in overflow-hidden">
                            <div className="py-1">
                                {GAME_MODES.map((mode) => (
                                    <button
                                        key={mode.name}
                                        onClick={() => setSelectedMode(mode)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition-colors ${selectedMode.name === mode.name ? 'bg-white/5' : ''}`}
                                    >
                                        <mode.icon className={`w-4 h-4 ${mode.color}`} />
                                        <span className="text-gray-200">{mode.name}</span>
                                        {selectedMode.name === mode.name && (
                                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        )}
                                    </button>
                                ))}

                                <div className="h-px bg-gray-700 my-1"></div>

                                <Link
                                    to="/"
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition-colors text-gray-200"
                                >
                                    <Home className="w-4 h-4 text-gray-400" />
                                    <span>Home</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Center: Title */}
                <div className="absolute left-1/2 -translate-x-1/2">
                    <h1 className="font-bold text-lg">CCNA 2 v7.0 Final Exam SRWE</h1>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <Volume2 className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                        <Settings className="w-5 h-5" />
                    </button>
                    <Link to="/">
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto w-full">

                {/* Illustration */}
                <div className="w-48 h-48 mb-8 relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"></div>
                    <div className="relative z-10 grid grid-cols-2 gap-2 transform rotate-12">
                        <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 shadow-xl w-20 h-24 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-red-400/20 flex items-center justify-center text-red-400">
                                <span className="text-xl">❤️</span>
                            </div>
                        </div>
                        <div className="bg-[#0f4a45] p-4 rounded-xl border border-teal-500/30 shadow-xl w-20 h-24 translate-y-4 flex items-center justify-center">
                            <div className="w-full h-1 bg-teal-500/50 rounded-full"></div>
                        </div>
                        <div className="bg-[#1e293b] p-4 rounded-xl border border-gray-700 shadow-xl w-20 h-24 -translate-y-2 flex items-center justify-center">
                            <div className="w-full h-1 bg-gray-600 rounded-full"></div>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-xl w-20 h-24 translate-y-2 flex flex-col gap-2 justify-center">
                            <div className="w-full h-1 bg-gray-200 rounded-full"></div>
                            <div className="w-2/3 h-1 bg-gray-200 rounded-full"></div>
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-4">Ready to play?</h2>

                <p className="text-gray-400 mb-10 max-w-md leading-relaxed">
                    Match all the terms with their definitions as fast as you can. Avoid wrong matches, they add extra time!
                </p>

                <div className="btn-wrapper w-full max-w-sm">
                    <button className="btn-premium w-full !py-4 !text-lg !rounded-2xl">
                        <span className="btn-text">Start game</span>
                    </button>
                </div>

                <div className="flex items-center gap-4 w-full max-w-sm">
                    <button className="btn-ghost flex-1 py-3 text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 rounded-xl">
                        <Settings className="w-4 h-4 mr-2" />
                        Options
                    </button>
                    <button className="btn-ghost flex-1 py-3 text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 rounded-xl">
                        <HelpCircle className="w-4 h-4 mr-2" />
                        Guide
                    </button>
                </div>

            </main>
        </div>
    );
}
