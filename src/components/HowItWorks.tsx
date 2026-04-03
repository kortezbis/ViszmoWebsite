import { motion } from 'framer-motion';

const steps = [
  {
    id: '1',
    title: 'Start Viszmo',
    description: 'Simply click Start Viszmo before your lecture begins.',
  },
  {
    id: '2',
    title: 'End Viszmo',
    description: "Click the Stop button to end recording. That's it.",
  },
  {
    id: '3',
    title: 'Get shareable notes',
    description: 'Viszmo uses what it heard and saw on your screen to generate shareable meeting notes and other study materials.',
  },
];

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 md:py-32 lg:py-48 px-4 relative z-10 bg-transparent overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 md:mb-24 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 text-slate-900 tracking-tight">
            Perfect notes in <span className="text-[#0ea5e9]">3 steps</span>
          </h2>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto">
            The easiest way to capture every detail without writing a single word.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative px-4 sm:px-0">
          {steps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              className="group relative flex flex-col items-center md:items-start text-center md:text-left"
            >
              {/* Image Placeholder Container */}
              <div className="relative w-full aspect-[4/3] rounded-[2rem] bg-slate-50 border border-slate-200 mb-8 overflow-hidden group hover:border-[#0ea5e9]/30 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-[#0ea5e9]/5">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 to-transparent flex items-center justify-center">
                  <div className="text-slate-400 text-xs font-mono tracking-widest uppercase opacity-60">Step {step.id} Visual</div>
                </div>
              </div>

              {/* Step Text */}
              <div className="flex gap-4 items-start max-w-sm">
                <span className="text-4xl md:text-5xl font-bold text-slate-200 leading-none select-none group-hover:text-[#0ea5e9]/20 transition-colors">{step.id}</span>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2 text-slate-900">{step.title}</h3>
                  <p className="text-base md:text-lg text-slate-500 leading-relaxed font-normal">{step.description}</p>
                </div>
              </div>

              {/* Connecting Arrows (Desktop only) */}
              {i < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-12 w-24 h-24 z-0 pointer-events-none -translate-y-full transform opacity-60">
                  <svg width="100%" height="100%" viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-300">
                    <path
                      d="M0 25 C 30 25, 40 5, 85 20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="4 4"
                    />
                    <path
                      d="M78 15 L 87 21 L 80 28"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

