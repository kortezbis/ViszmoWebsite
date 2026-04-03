
import { motion } from 'framer-motion';

export const LiquidBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-[#050505] overflow-hidden">

      {/* 1. Subtle Grid Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-[0.15]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
        }}
      />

      {/* 2. Top Center - Primary Glow (Purple/Indigo) */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-[10%] left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-[#6366f1] blur-[140px] mix-blend-screen"
      />

      {/* 3. Top Left - Secondary Glow (Cyan/Blue) */}
      <motion.div
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute top-[5%] -left-[10%] h-[500px] w-[500px] rounded-full bg-[#0ea5e9] blur-[120px] mix-blend-screen"
      />

      {/* 4. Top Right - Accent Glow (Violet/Pink) */}
      <motion.div
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute top-[10%] -right-[10%] h-[500px] w-[600px] rounded-full bg-[#8b5cf6] blur-[130px] mix-blend-screen"
      />

      {/* 5. Bottom Ambient Glow - Deeper Blue */}
      <motion.div
        animate={{
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-0 left-0 right-0 h-[400px] bg-gradient-to-t from-[#1e1b4b] to-transparent opacity-30 blur-[60px]"
      />

      {/* 6. Scanline/Noise texture (Optional, keeps it clean for now) */}
      {/* <div className="absolute inset-0 z-10 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("/noise.png")' }}></div> */}

    </div>
  );
};
