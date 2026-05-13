import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { motion, type Variants } from 'framer-motion';

interface PeelStickerProps {
  logoUrl: string;
  alt: string;
  index: number;
  style?: CSSProperties;
  delay?: number;
}

export const PeelSticker = ({ logoUrl, alt, index, style, delay = 0 }: PeelStickerProps) => {
  const stickerContainerRef = useRef<HTMLDivElement>(null);
  const uniqueId = `sticker-${index}`;

  const variants: Variants = {
    initial: {
      "--peel-progress": 120,
      opacity: 0,
    } as any,
    animate: {
      "--peel-progress": 0,
      opacity: 1,
      transition: {
        "--peel-progress": {
          duration: 2.5,
          ease: [0.22, 1, 0.36, 1],
          delay: delay
        },
        opacity: { duration: 0.3, delay: delay }
      }
    } as any,
    exit: {
      "--peel-progress": 120,
      opacity: 1,
      transition: {
        "--peel-progress": {
          duration: 2.0,
          ease: [0.7, 0, 0.84, 0]
        }
      }
    } as any,
    hover: {
      "--peel-progress": 25,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    } as any
  };

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      style={{
        position: 'absolute',
        pointerEvents: 'auto',
        ...style
      }}
      className="trigger-peel"
    >
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id={`outerStroke-${uniqueId}`}>
            <feMorphology operator="dilate" radius="6" in="SourceAlpha" result="expanded" />
            <feFlood floodColor="white" result="white" />
            <feComposite operator="in" in="white" in2="expanded" result="stroke" />
            <feComposite operator="over" in="SourceGraphic" in2="stroke" />
          </filter>

          <filter id={`expandAndFill-${uniqueId}`}>
            <feMorphology operator="dilate" radius="6" in="SourceAlpha" result="expanded" />
            <feFlood floodColor="#d1d5db" result="flood" />
            <feComposite operator="in" in="flood" in2="expanded" />
          </filter>
        </defs>
      </svg>

      <div className="sticker-container" ref={stickerContainerRef}>
        <div className="sticker-main">
          <img
            src={logoUrl}
            alt={alt}
            className="sticker-image"
            draggable={false}
            width="200"
            height="200"
            loading="lazy"
            style={{
              filter: `url(#outerStroke-${uniqueId}) drop-shadow(0 4px 6px rgba(0,0,0,0.2))`,
              willChange: 'filter'
            }}
          />
        </div>

        <div className="shadow">
          <div className="flap">
            <img
              src={logoUrl}
              alt={alt}
              className="shadow-image"
              draggable={false}
              width="200"
              height="200"
              loading="lazy"
              style={{ filter: `url(#expandAndFill-${uniqueId}) blur(4px)`, opacity: 0.3 }}
            />
          </div>
        </div>

        <div className="flap">
          <img
            src={logoUrl}
            alt={alt}
            className="flap-image"
            draggable={false}
            width="200"
            height="200"
            loading="lazy"
            style={{ filter: `url(#expandAndFill-${uniqueId})` }}
          />
        </div>
      </div>
    </motion.div>
  );
};

