import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// List of software/platforms commonly used in educational environments
// Logos are in /public/bypassed/ and /public/teamlogos/ folders
const EDUCATIONAL_SOFTWARE = [
  { name: 'Zoom', file: 'Zoom.png', path: 'bypassed' },
  { name: 'Microsoft Teams', file: 'teams.845b90a5.png', path: 'teamlogos' },
  { name: 'Google Meet', file: 'logo_meet_2020q4_color_2x_web_96dp.png', path: 'bypassed' },
  { name: 'Webex', file: 'webex.png', path: 'bypassed' },
  { name: 'Slack', file: 'Slack.png', path: 'bypassed' },
  { name: 'Pearson', file: 'Pearson-Logo1.png', path: 'bypassed' },
];

export const UndetectableSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate through software logos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % EDUCATIONAL_SOFTWARE.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-white border-y border-gray-100">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900">
            Works seamlessly with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">your existing tools</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-4">
            Viszmo is designed to work alongside the platforms you already use, providing assistance when you need it most.
          </p>
        </motion.div>

        {/* Software Showcase */}
        <div className="relative">

          {/* Rotating Logo Display - Desktop */}
          <div className="hidden md:block relative h-64 md:h-80">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Center Logo - Currently Active */}
              <motion.div
                key={currentIndex}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute z-20 w-48 h-48 md:w-64 md:h-64 flex items-center justify-center"
              >
                <div className="relative w-full h-full rounded-xl bg-white border border-gray-200 shadow-xl p-6 flex items-center justify-center">
                  <img
                    src={`/${EDUCATIONAL_SOFTWARE[currentIndex].path}/${EDUCATIONAL_SOFTWARE[currentIndex].file}`}
                    alt={EDUCATIONAL_SOFTWARE[currentIndex].name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback to text if image doesn't exist
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.className = 'text-2xl font-bold text-gray-900';
                      fallback.textContent = EDUCATIONAL_SOFTWARE[currentIndex].name;
                      target.parentElement?.appendChild(fallback);
                    }}
                  />
                </div>
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                  <p className="text-sm font-medium text-gray-600 whitespace-nowrap">
                    {EDUCATIONAL_SOFTWARE[currentIndex].name}
                  </p>
                </div>
              </motion.div>

              {/* Surrounding Logos - Rotating Circle */}
              {EDUCATIONAL_SOFTWARE.map((software, index) => {
                if (index === currentIndex) return null;

                const angle = (index * 360) / EDUCATIONAL_SOFTWARE.length;
                const radius = 200;
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;

                return (
                  <motion.div
                    key={software.name}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: 0.6,
                      opacity: 0.4,
                      x,
                      y,
                    }}
                    transition={{ duration: 0.5 }}
                    className="absolute w-24 h-24 md:w-32 md:h-32 flex items-center justify-center"
                  >
                    <div className="w-full h-full rounded-xl bg-white border border-gray-100 shadow-md backdrop-blur-sm p-3 flex items-center justify-center">
                      <img
                        src={`/${software.path}/${software.file}`}
                        alt={software.name}
                        className="w-full h-full object-contain opacity-60"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Grid Layout - Mobile & Tablet */}
          <div className="md:hidden grid grid-cols-2 sm:grid-cols-3 gap-4">
            {EDUCATIONAL_SOFTWARE.map((software, index) => (
              <motion.div
                key={software.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="relative aspect-square rounded-xl bg-white border border-gray-100 shadow-sm p-4 flex flex-col items-center justify-center"
              >
                <img
                  src={`/${software.path}/${software.file}`}
                  alt={software.name}
                  className="w-full h-3/4 object-contain mb-2"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'text-sm font-bold text-gray-900 text-center';
                    fallback.textContent = software.name;
                    target.parentElement?.appendChild(fallback);
                  }}
                />
                <p className="text-xs text-gray-500 text-center mt-auto">{software.name}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Subtle Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-gray-500 italic max-w-3xl mx-auto">
            Viszmo is a study assistance tool designed to help students learn more effectively.
            We encourage responsible use and compliance with your institution's academic policies.
          </p>
        </motion.div>
      </div>

    </section>
  );
};
