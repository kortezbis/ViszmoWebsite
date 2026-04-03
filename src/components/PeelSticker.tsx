import { useEffect, useRef, type CSSProperties } from 'react';
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
  const pointLightRef = useRef<SVGFEPointLightElement>(null);
  const pointLightFlippedRef = useRef<SVGFEPointLightElement>(null);

  useEffect(() => {
    const stickerContainer = stickerContainerRef.current;
    const pointLight = pointLightRef.current;
    const pointLightFlipped = pointLightFlippedRef.current;

    if (!stickerContainer || !pointLight || !pointLightFlipped) return;

    const updateLightPosition = (e: MouseEvent) => {
      const rect = stickerContainer.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;

      // Update light position based on mouse relative to the sticker
      pointLight.setAttribute('x', String(relativeX));
      pointLight.setAttribute('y', String(relativeY));
      pointLightFlipped.setAttribute('x', String(relativeX));
      pointLightFlipped.setAttribute('y', String(rect.height - relativeY));
    };

    // Use document event for smoother tracking
    document.addEventListener('mousemove', updateLightPosition);

    return () => {
      document.removeEventListener('mousemove', updateLightPosition);
    };
  }, []);

  const uniqueId = `sticker-${index}`;

  // Variants for the peel animation
  // using a numeric value (0-100) for reliable CSS calculation
  const variants: Variants = {
    initial: {
      "--peel-progress": 120, // Fully peeled off (bottom)
      opacity: 0, // Start invisible to avoid artifacts
    } as any,
    animate: {
      "--peel-progress": 0, // Fully stuck (top/flat)
      opacity: 1,
      transition: {
        "--peel-progress": {
          duration: 2.5, // Slower, "a little longer"
          ease: [0.22, 1, 0.36, 1], // Smooth sticky ease
          delay: delay
        },
        opacity: { duration: 0.3, delay: delay } // Fade in as it starts peeling
      }
    } as any,
    exit: {
      "--peel-progress": 120, // Peel off again
      opacity: 1, // Keep visible (no fade out)
      transition: {
        "--peel-progress": {
          duration: 2.0,
          ease: [0.7, 0, 0.84, 0] // Accelerate out
        }
      }
    } as any,
    hover: {
      "--peel-progress": 25, // Slight peel back
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
      drag
      dragMomentum={false}
      whileDrag={{ scale: 1.1, zIndex: 100, cursor: 'grabbing' }}
      style={{
        position: 'absolute',
        cursor: 'grab',
        pointerEvents: 'auto',
        ...style
      }}
      className="trigger-peel"
    >
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id={`pointLight-${uniqueId}`}>
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feSpecularLighting result="spec" in="blur" specularExponent="100" specularConstant="0.1" lightingColor="white">
              <fePointLight ref={pointLightRef} x="100" y="100" z="300" />
            </feSpecularLighting>
            <feComposite in="spec" in2="SourceGraphic" operator="screen" result="lit" />
            <feComposite in="lit" in2="SourceAlpha" operator="in" />
          </filter>

          <filter id={`pointLightFlipped-${uniqueId}`}>
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feSpecularLighting result="spec" in="blur" specularExponent="100" specularConstant="0.7" lightingColor="white">
              <fePointLight ref={pointLightFlippedRef} x="100" y="100" z="300" />
            </feSpecularLighting>
            <feComposite in="spec" in2="SourceGraphic" operator="screen" result="lit" />
            <feComposite in="lit" in2="SourceAlpha" operator="in" />
          </filter>

          <filter id={`dropShadow-${uniqueId}`}>
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="black" floodOpacity="0.6" />
          </filter>

          <filter id={`outerStroke-${uniqueId}`}>
            <feMorphology operator="dilate" radius="10" in="SourceAlpha" result="expanded" />
            <feColorMatrix in="expanded" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" result="whiteExpanded" />
            <feComposite operator="xor" in="whiteExpanded" in2="SourceAlpha" result="outerStroke" />
            <feComposite operator="over" in="SourceGraphic" in2="outerStroke" />
          </filter>

          <filter id={`expandAndFill-${uniqueId}`}>
            <feMorphology operator="dilate" radius="10" in="SourceAlpha" result="expanded" />
            <feFlood floodColor="rgb(179, 179, 179)" result="flood" />
            <feComposite operator="in" in="flood" in2="expanded" />
          </filter>
        </defs>
      </svg>

      <div className="sticker-container" ref={stickerContainerRef}>
        <div className="sticker-main">
          <div className="sticker-lighting" style={{ filter: `url(#pointLight-${uniqueId})` }}>
            <img
              src={logoUrl}
              alt={alt}
              className="sticker-image"
              draggable={false}
              style={{
                filter: `url(#outerStroke-${uniqueId}) url(#dropShadow-${uniqueId})`,
              }}
            />
          </div>
        </div>

        <div className="shadow">
          <div className="flap">
            <img
              src={logoUrl}
              alt={alt}
              className="shadow-image"
              draggable={false}
              style={{ filter: `url(#expandAndFill-${uniqueId})` }}
            />
          </div>
        </div>

        <div className="flap">
          <div className="flap-lighting" style={{ filter: `url(#pointLightFlipped-${uniqueId})` }}>
            <img
              src={logoUrl}
              alt={alt}
              className="flap-image"
              draggable={false}
              style={{ filter: `url(#expandAndFill-${uniqueId})` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
