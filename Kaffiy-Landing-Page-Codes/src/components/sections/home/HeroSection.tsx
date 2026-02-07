import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function HeroSection() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const accentColor = "hsl(var(--primary) / 0.9)";

  // Parallax effect for blobs
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        setMousePosition({ x, y });
      }
    };

    const section = sectionRef.current;
    if (section) {
      section.addEventListener('mousemove', handleMouseMove);
      return () => section.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="overflow-hidden relative pt-16 sm:pt-20 md:pt-28 pb-16 sm:pb-20 md:pb-28 bg-hero" 
    >
      {/* Technical Grid Pattern - Premium, very subtle */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148, 163, 184, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 90% 80% at 50% 45%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 50% 45%, black 40%, transparent 100%)',
        }}
      />

      {/* Subtle theme-colored radial gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full blur-3xl"
          style={{
            opacity: 0.07,
            background: `radial-gradient(ellipse, hsl(var(--primary) / 0.2) 0%, hsl(var(--primary) / 0.04) 40%, transparent 70%)`,
            animation: 'float 25s ease-in-out infinite',
            transform: `translate(calc(-50% + ${mousePosition.x * 20}px), calc(-50% + ${mousePosition.y * 20}px))`,
            transition: 'transform 0.1s ease-out, background 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>

      <div className="section-container relative z-10 px-3 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-heading mb-5 sm:mb-6 md:mb-8 leading-[1.12] animate-fade-in-up tracking-tight px-1 sm:px-2 text-slate-900 dark:text-slate-50"
            style={{
              fontWeight: 800,
              letterSpacing: '-0.035em',
              transition: 'color 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {(() => {
              const headline = t("hero.headline");
              const highlightPhrase = t("hero.highlight");
              const regex = new RegExp(`(${highlightPhrase})`, "i");
              return headline.split(regex).map((part, index) => 
                regex.test(part) ? (
                  <span key={index} style={{ color: accentColor }}>{part}</span>
                ) : (
                  <span key={index}>{part}</span>
                )
              );
            })()}
          </h1>

          <p 
            className="text-[15px] sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-10 leading-[1.75] sm:leading-[1.8] animate-fade-in-up text-slate-600 dark:text-slate-400 px-1" 
            style={{ 
              animationDelay: "0.08s",
              transition: 'color 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {t("hero.subheadline")}
          </p>

          {/* Social Proof */}
          <div 
            className="flex flex-col items-center gap-2 mb-8 sm:mb-10 md:mb-12 animate-fade-in-up" 
            style={{ animationDelay: "0.12s" }}
          >
            <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-medium text-primary"
                    style={{ animationDelay: `${0.15 + i * 0.05}s` }}
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span className="ml-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Erken Erişim</span> kafeler 
                <span className="mx-1">·</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Yüksek</span> memnuniyet
              </span>
            </div>
          </div>

          <div 
            className="flex flex-col sm:flex-row items-center sm:items-start justify-center gap-4 animate-fade-in-up" 
            style={{ animationDelay: "0.15s" }}
          >
            <div className="flex flex-col items-center gap-2">
              <Button 
                asChild 
                size="lg" 
                className="bg-primary text-primary-foreground hover:opacity-95 rounded-xl px-10 sm:px-12 h-12 sm:h-14 text-base font-semibold hover:-translate-y-0.5 hover:scale-[1.02] relative group border border-white/20 shrink-0"
                style={{
                  backgroundColor: accentColor,
                  borderColor: 'rgba(255,255,255,0.25)',
                  boxShadow: '0 1px 0 0 rgba(255,255,255,0.2) inset, 0 2px 4px rgba(0,0,0,0.04), 0 6px 20px -2px hsl(var(--primary) / 0.35)',
                  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 0 0 rgba(255,255,255,0.25) inset, 0 4px 8px rgba(0,0,0,0.04), 0 12px 32px -4px hsl(var(--primary) / 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 0 0 rgba(255,255,255,0.2) inset, 0 2px 4px rgba(0,0,0,0.04), 0 6px 20px -2px hsl(var(--primary) / 0.35)';
                }}
              >
                <Link to="/contact">
                  {t("hero.cta.primary")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                  <span 
                    className="absolute inset-0 rounded-xl bg-primary opacity-0 group-hover:opacity-20 blur-xl -z-10" 
                    style={{ backgroundColor: accentColor, transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />
                </Link>
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-xl px-8 sm:px-10 h-12 sm:h-14 text-base hover:bg-white/60 shrink-0"
              style={{
                color: accentColor,
                borderColor: 'rgba(148, 163, 184, 0.4)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              asChild
            >
              <a href="#how-it-works">{t("hero.cta.secondary")}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
