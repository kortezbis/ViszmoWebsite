

const testimonials = [
    {
        name: "Alex M.",
        role: "CS Major",
        school: "U of Toronto",
        content: "Viszmo basically saved my GPA. The transcription is insane—it catches everything my prof mumbles.",
        rotation: "rotate-1"
    },
    {
        name: "Sarah K.",
        role: "Pre-Med",
        school: "UCLA",
        content: "The stealth overlay is a game changer. It's invisible and gives me the confidence I need.",
        rotation: "-rotate-2"
    },
    {
        name: "David L.",
        role: "Engineering",
        school: "Texas A&M",
        content: "I turn my lecture slides into quizzes instantly. It's like having a personal tutor 24/7.",
        rotation: "rotate-2"
    },
    {
        name: "Emily R.",
        role: "Business",
        school: "NYU",
        content: "The auto-summary feature saves me hours. I can actually focus on listening now.",
        rotation: "-rotate-1"
    },
    {
        name: "Michael T.",
        role: "Law Student",
        school: "Harvard",
        content: "The accuracy of the legal terminology is surprising. Definitely a must-have tool.",
        rotation: "rotate-3"
    },
    {
        name: "Jessica W.",
        role: "Psychology",
        school: "FSU",
        content: "Super easy. I love how it floats over my other windows so I don't switch back and forth.",
        rotation: "-rotate-3"
    }
];

export const Testimonials = () => {
    return (
        <section className="py-24 bg-transparent overflow-hidden relative">

            <div className="max-w-7xl mx-auto px-4 md:px-6 mb-16 text-center relative z-10">
                <div className="inline-block mb-3 px-4 py-1.5 rounded-full bg-yellow-100 border border-yellow-200 text-yellow-700 text-sm font-bold tracking-wide uppercase transform -rotate-2">
                    Student Reviews
                </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
                    Straight A's from <br />
                    <span className="relative inline-block text-white bg-[#0ea5e9] px-4 py-1 transform -skew-x-6 mx-2 shadow-lg">
                        <span className="block transform skew-x-6">Real Students</span>
                    </span>
                </h2>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
                    See what the '25-'26 students are saying about their invisible advantage.
                </p>
            </div>

            {/* Scrolling Marquee */}
            <div className="relative w-full overflow-hidden pb-10">
                <div className="flex gap-8 animate-scroll-left min-w-max px-4">
                    {[...testimonials, ...testimonials].map((t, i) => (
                        <div
                            key={i}
                            className={`
                relative w-[320px] md:w-[380px] h-[240px] p-6 
                bg-[#fdfbf7] shadow-lg transition-all duration-500 ease-out
                flex flex-col justify-between group cursor-default
                ${t.rotation} transform hover:rotate-0 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.15)] hover:z-20
              `}
                            style={{
                                background: `
                  linear-gradient(to right, rgba(239, 68, 68, 0.1) 2px, transparent 2px) 24px 0,
                  repeating-linear-gradient(transparent, transparent 27px, #e2e8f0 27px, #e2e8f0 28px),
                  #fdfbf7
                `,
                                backgroundSize: '100% 100%, 100% 100%, 100% 100%'
                            }}
                        >
                            {/* Pin / Tape Effect (Optional visual flair) */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-yellow-200/50 rotate-1 shadow-sm mix-blend-multiply opacity-80 backdrop-blur-[1px]"></div>

                            {/* Handwriting Content */}
                            <div className="relative z-10 pt-4 pl-6"> {/* Padding left to clear red line */}
                                <p
                                    className="text-slate-700 text-lg leading-[28px] font-medium"
                                    style={{ fontFamily: '"Kalam", "Patrick Hand", cursive, "Inter"', fontStyle: 'normal' }}
                                >
                                    {t.content}
                                </p>
                            </div>

                            {/* Footer Info */}
                            <div className="relative z-10 flex items-center justify-between mt-4 pl-6 border-t border-slate-200/50 pt-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm border-2 border-white shadow-sm">
                                        {t.name.charAt(0)}
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-slate-800 text-sm">{t.name}</div>
                                        <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">{t.school}</div>
                                    </div>
                                </div>
                                <div className="text-[#fbbf24] flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&display=swap');
        @keyframes scroll-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-scroll-left {
          animation: scroll-left 45s linear infinite;
        }
        .animate-scroll-left:hover {
          animation-play-state: paused;
        }
      `}</style>
        </section>
    );
};
