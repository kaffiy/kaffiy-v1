import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";

// Light mode screenshots
import appUi1Light from "@/assets/kaffiy-telefon-ui-1.png";
import appUi2Light from "@/assets/kaffiy-telefon-ui-2.png";
import appQrLight from "@/assets/kaffiy-telefon-qr.png";

// Dark mode screenshots
import appUi1Dark from "@/assets/kaffiy-telefon-ui-1-dark.png";
import appUi2Dark from "@/assets/kaffiy-telefon-ui-2-dark.png";
import appQrDark from "@/assets/kaffiy-telefon-qr-2.png";

interface PhoneMockupProps {
  image: string;
  alt: string;
  label: string;
  position: "left" | "center" | "right";
  animationDelay?: number;
  isVisible?: boolean;
  isTransitioning?: boolean;
}

function PhoneMockup({ 
  image, 
  alt, 
  label, 
  position, 
  animationDelay = 0,
  isVisible = true,
  isTransitioning = false,
}: PhoneMockupProps) {
  const isCenter = position === "center";
  const isLeft = position === "left";
  const isRight = position === "right";

  // 3D transform values - responsive
  const transformStyles = {
    left: {
      transform: "perspective(1200px) rotateY(15deg) rotateX(5deg) translateX(-20px) translateZ(-50px) scale(0.85)",
      transformMobile: "perspective(800px) rotateY(10deg) rotateX(3deg) translateX(-15px) translateZ(-30px) scale(0.75)",
      zIndex: 1,
    },
    center: {
      transform: "perspective(1200px) rotateY(0deg) rotateX(0deg) translateZ(0px) scale(1)",
      transformMobile: "perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0px) scale(0.9)",
      zIndex: 3,
    },
    right: {
      transform: "perspective(1200px) rotateY(-15deg) rotateX(5deg) translateX(20px) translateZ(-50px) scale(0.85)",
      transformMobile: "perspective(800px) rotateY(-10deg) rotateX(3deg) translateX(15px) translateZ(-30px) scale(0.75)",
      zIndex: 1,
    },
  };

  const currentStyle = transformStyles[position];

  const baseTransform = currentStyle.transform;
  const initialTransform = isVisible 
    ? `${baseTransform} translateY(0)` 
    : `${baseTransform} translateY(60px)`;

  return (
    <div 
      className="flex flex-col items-center gap-4 group transition-all duration-500 ease-out snap-center flex-shrink-0"
      style={{
        transform: initialTransform,
        transformStyle: "preserve-3d",
        zIndex: currentStyle.zIndex,
        opacity: isVisible ? 1 : 0,
        transition: `opacity 0.8s ease-out ${animationDelay}s, transform 0.8s ease-out ${animationDelay}s`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = `${baseTransform} translateY(-15px) translateZ(20px) scale(1.02)`;
        e.currentTarget.style.transition = 'transform 0.3s ease-out';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = `${baseTransform} translateY(0)`;
        e.currentTarget.style.transition = 'transform 0.5s ease-out';
      }}
    >
      <div 
        className={`relative rounded-[2.5rem] p-[10px] transition-all duration-700 bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 ${isCenter ? 'w-[120px] sm:w-[200px] md:w-[240px]' : 'w-[100px] sm:w-[160px] md:w-[200px]'}`}
        style={{ 
          boxShadow: isCenter 
            ? '0 30px 80px -20px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.3), inset 0 0 20px rgba(255,255,255,0.1)' 
            : '0 20px 60px -15px rgba(0,0,0,0.4), 0 0 30px rgba(0,0,0,0.2)',
        }}
      >
        {/* Ambient glow effect - Enhanced in dark mode */}
        <div 
          className={`absolute inset-0 rounded-[2.5rem] blur-2xl ${
            isCenter ? 'opacity-30' : 'opacity-30'
          }`}
          style={{
            transform: 'translateZ(-10px)',
            background: isCenter
              ? `linear-gradient(to bottom right, hsl(var(--primary) / 0.4), hsl(var(--accent) / 0.3), hsl(var(--primary) / 0.2))`
              : `linear-gradient(to bottom right, hsl(var(--primary) / 0.2), hsl(var(--accent) / 0.15), transparent)`,
            transition: 'background 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
        
        {/* Dynamic Island */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-7 rounded-full z-20 bg-black/95 shadow-2xl" />
        
        {/* Side buttons - Volume */}
        <div className="absolute -left-[3px] top-32 w-[4px] h-8 rounded-l-sm bg-slate-500/90" />
        <div className="absolute -left-[3px] top-40 w-[4px] h-14 rounded-l-sm bg-slate-500/90" />
        <div className="absolute -left-[3px] top-56 w-[4px] h-14 rounded-l-sm bg-slate-500/90" />
        
        {/* Side buttons - Power */}
        <div className="absolute -right-[3px] top-40 w-[4px] h-18 rounded-r-sm bg-slate-500/90" />
        
        {/* Screen with reflection and cross-fade */}
        <div className="relative rounded-[2.3rem] overflow-hidden bg-white"
        style={{
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.3), 0 0 20px rgba(0,0,0,0.2)',
        }}>
          <div className="relative w-full h-full">
            <img 
              src={image} 
              alt={alt} 
              className="w-full h-auto"
              style={{
                opacity: isTransitioning ? 0.2 : 1,
                transform: isTransitioning ? 'scale(1.08) blur(2px)' : 'scale(1) blur(0px)',
                filter: isTransitioning ? 'brightness(0.7)' : 'brightness(1)',
                transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), filter 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              loading="lazy"
            />
            {/* Screen reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
            {/* Morph overlay during transition */}
            {isTransitioning && (
              <div 
                className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent pointer-events-none"
                style={{
                  animation: 'pulse 0.6s ease-in-out',
                }}
              />
            )}
          </div>
        </div>
        
        {/* Home indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-28 h-1.5 rounded-full bg-slate-400/70" />
      </div>
      <span 
        className={`text-xs md:text-sm text-muted-foreground font-medium px-3 py-1.5 rounded-lg bg-secondary/30 backdrop-blur-sm transition-all duration-300 ${
          isCenter ? 'opacity-100 scale-100' : 'opacity-70 scale-95'
        } group-hover:bg-secondary/50`}
      >
        {label}
      </span>
    </div>
  );
}

export function AppShowcaseSection() {
  const { t } = useI18n();
  const [isLightMode, setIsLightMode] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Staggered fade-in animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle mode switch with smooth transition
  const handleModeSwitch = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsLightMode(!isLightMode);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 350);
  };

  return (
    <section 
      className="section-padding overflow-hidden relative bg-section"
    >
      {/* Subtle theme-colored gradient */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, hsl(var(--primary) / 0.05) 0%, transparent 65%)`,
          filter: 'blur(120px)',
          transition: 'background 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            width: '800px',
            height: '800px',
            opacity: 0.05,
            background: `radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, hsl(var(--primary) / 0.03) 40%, transparent 70%)`,
            filter: 'blur(100px)',
            transition: 'background 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>

      <div className="section-container relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 sm:mb-6 tracking-tight text-slate-900 dark:text-slate-50"
              style={{ letterSpacing: '-0.04em' }}
            >
              {t("appShowcase.title")}
            </h2>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl mx-auto text-slate-800 dark:text-slate-300 px-2">
              {t("appShowcase.desc")}
            </p>
          </div>

          {/* Mode Toggle Buttons - min 44px touch target */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
            <button
              onClick={handleModeSwitch}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full text-sm font-medium shadow-lg ${
                isLightMode
                  ? 'bg-secondary/50 text-foreground scale-100'
                  : 'bg-secondary/20 text-muted-foreground scale-95 hover:scale-100'
              }`}
              style={{
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              ☀️ {t("appShowcase.lightMode")}
            </button>
            <button
              onClick={handleModeSwitch}
              className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full text-sm font-medium shadow-lg ${
                !isLightMode
                  ? 'bg-gray-800 text-gray-100 scale-100'
                  : 'bg-gray-800/50 text-gray-300 scale-95 hover:scale-100'
              }`}
              style={{
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              🌙 {t("appShowcase.darkMode")}
            </button>
          </div>

          {/* 3D Phone Composition - yatay kaydırma mobilde */}
          <div 
            className="relative flex items-center justify-center min-h-[340px] sm:min-h-[420px] md:min-h-[600px] lg:min-h-[700px]"
            style={{ perspective: "1200px" }}
          >
            <div className="relative flex items-center justify-center w-full max-w-full overflow-x-auto overflow-y-visible md:overflow-visible pb-3 md:pb-0 snap-x snap-mandatory md:snap-none -mx-4 px-4 md:mx-0 md:px-0" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="flex flex-nowrap md:flex-initial items-center justify-start md:justify-center gap-4 md:gap-8 min-w-max md:min-w-0">
              {/* Left Phone - Ana Sayfa */}
              <PhoneMockup 
                image={isLightMode ? appUi2Light : appUi2Dark} 
                alt={isLightMode ? "Kaffiy uygulaması - Üye kafeleri ve aktivite ekranı" : "Kaffiy uygulaması karanlık mod - Üye kafeleri ve aktivite ekranı"} 
                label={t("appShowcase.home")}
                position="left"
                animationDelay={0.1}
                isVisible={isVisible}
                isTransitioning={isTransitioning}
              />
              
              {/* Center Phone - Sadakat Kartı (Focus) */}
              <PhoneMockup 
                image={isLightMode ? appUi1Light : appUi1Dark} 
                alt={isLightMode ? "Kaffiy uygulaması - Sadakat kartı ekranı" : "Kaffiy uygulaması karanlık mod - Sadakat kartı ekranı"} 
                label={t("appShowcase.loyalty")}
                position="center"
                animationDelay={0.2}
                isVisible={isVisible}
                isTransitioning={isTransitioning}
              />
              
              {/* Right Phone - QR Kod */}
              <PhoneMockup 
                image={isLightMode ? appQrLight : appQrDark} 
                alt={isLightMode ? "Kaffiy uygulaması - QR kod ekranı" : "Kaffiy uygulaması karanlık mod - QR kod ekranı"} 
                label={t("appShowcase.qr")}
                position="right"
                animationDelay={0.3}
                isVisible={isVisible}
                isTransitioning={isTransitioning}
              />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
