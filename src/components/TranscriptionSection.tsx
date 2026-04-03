import { motion } from 'framer-motion';

export const TranscriptionSection = () => {
  return (
    <section className="relative py-24 md:py-32 bg-black/20 border-y border-white/5 overflow-hidden">
      {/* Subtle background glow to match other sections */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-x-16">
          {/* Left Side - Visual Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative order-2 lg:order-1 w-full max-w-lg"
          >
            <div className="rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
              {/* Glass shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

              {/* Mockup Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5 relative z-10">
                <div className="text-xs text-gray-400 font-medium tracking-wide uppercase">Monday, Nov 18</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/40 border border-white/10 flex items-center justify-center text-[8px] font-bold">PS</div>
                  <div className="w-6 h-6 rounded-full bg-blue-500/40 border border-white/10 -ml-2 flex items-center justify-center text-[8px] font-bold">VS</div>
                  <div className="w-6 h-6 rounded-full bg-emerald-500/40 border border-white/10 -ml-2"></div>
                  <span className="text-[10px] text-gray-400 ml-1.5 font-medium">Prof. Smith, Viszmo, +25</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg md:text-xl font-bold mb-6 text-white leading-tight relative z-10">
                Introduction to Quantum Mechanics - Lecture 12
              </h3>

              {/* Tabs */}
              <div className="flex gap-4 mb-6 border-b border-white/5 relative z-10">
                <button className="pb-3 text-xs md:text-sm text-gray-500 border-b-2 border-transparent hover:text-gray-300 transition-colors">
                  Summary
                </button>
                <button className="pb-3 text-xs md:text-sm text-gray-500 border-b-2 border-transparent hover:text-gray-300 transition-colors">
                  Transcript
                </button>
                <button className="pb-3 text-xs md:text-sm text-indigo-400 border-b-2 border-indigo-500 font-bold">
                  Chats
                </button>
              </div>

              {/* Chat/Transcript Content */}
              <div className="space-y-5 max-h-[380px] overflow-y-auto pr-2 relative z-10 custom-scrollbar">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex-shrink-0 flex items-center justify-center border border-blue-500/30">
                    <span className="text-[10px] font-bold text-blue-300">PS</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-blue-300">Prof. Smith</span>
                      <span className="text-[10px] text-gray-500 font-medium">2:15 PM</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
                      "Can anyone explain Heisenberg's uncertainty principle?"
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex-shrink-0 flex items-center justify-center border border-indigo-500/30">
                    <span className="text-[10px] font-bold text-indigo-300">VS</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-indigo-300">Viszmo</span>
                      <span className="text-[10px] text-gray-500 font-medium">2:15 PM</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
                      The uncertainty principle states that the more precisely you know a particle's position, the less precisely you can know its momentum, and vice versa. This is a fundamental property of quantum mechanics.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex-shrink-0 flex items-center justify-center border border-blue-500/30">
                    <span className="text-[10px] font-bold text-blue-300">PS</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-blue-300">Prof. Smith</span>
                      <span className="text-[10px] text-gray-500 font-medium">2:18 PM</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
                      "Excellent. Quick pop quiz: What does the wave function ψ represent?"
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex-shrink-0 flex items-center justify-center border border-indigo-500/30">
                    <span className="text-[10px] font-bold text-indigo-300">VS</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-indigo-300">Viszmo</span>
                      <span className="text-[10px] text-gray-500 font-medium">2:18 PM</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
                      The wave function ψ represents the probability amplitude of finding a particle at a specific location. Options: A) Energy B) Probability amplitude ✓ C) Velocity
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2 flex-1"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-12 md:mb-16 text-white tracking-tight">
              Real-time <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">lecture transcription</span>
            </h2>

            <div className="space-y-10 md:space-y-12">
              {/* Feature 1 - Languages */}
              <div className="group">
                <div className="flex items-baseline gap-4 mb-3">
                  <div className="text-5xl md:text-6xl lg:text-7xl font-bold text-white group-hover:text-indigo-400 transition-colors duration-300">12+</div>
                  <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">Languages</h3>
                </div>
                <p className="text-base md:text-lg text-gray-400 leading-relaxed max-w-md">
                  We support over 12 different languages, including English, Chinese, Spanish, and more. Perfect for international students and multilingual courses.
                </p>
              </div>

              {/* Feature 2 - Response Time */}
              <div className="group">
                <div className="flex items-baseline gap-4 mb-3">
                  <div className="text-5xl md:text-6xl lg:text-7xl font-bold text-white group-hover:text-indigo-400 transition-colors duration-300">300<span className="text-3xl md:text-4xl">ms</span></div>
                  <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">Response time</h3>
                </div>
                <p className="text-base md:text-lg text-gray-400 leading-relaxed max-w-md">
                  Get instant answers during pop quizzes and on-the-spot questions. Never miss a beat when your professor calls on you.
                </p>
              </div>

              {/* Feature 3 - Accuracy */}
              <div className="group">
                <div className="flex items-baseline gap-4 mb-3">
                  <div className="text-5xl md:text-6xl lg:text-7xl font-bold text-white group-hover:text-indigo-400 transition-colors duration-300">95%</div>
                  <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">Transcription accuracy</h3>
                </div>
                <p className="text-base md:text-lg text-gray-400 leading-relaxed max-w-md">
                  Trusted by thousands of students for reliable lecture transcription. Never miss important details during exams or quizzes.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

