import { motion } from 'framer-motion';

export const HeroMockup = () => {
  return (
    <div className="relative w-full max-w-7xl mx-auto perspective-1000">
      <motion.div
        initial={{ rotateX: 5, opacity: 0, y: 50 }}
        animate={{ rotateX: 0, opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative rounded-2xl border border-white/10 bg-[#0f0f0f] shadow-[0_0_50px_-12px_rgba(0,0,0,0.7)] overflow-hidden aspect-video group"
        style={{ minHeight: 'auto', maxHeight: '720px' }}
      >
        {/* Window Controls */}
        <div className="absolute top-4 left-4 flex gap-2 z-20">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50" />
          <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50" />
        </div>

        {/* Hero Area - Blank */}
        <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a]">
          {/* Subtle overlay for better visual integration */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
        </div>
      </motion.div>
    </div>
  );
};
