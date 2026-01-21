import { QrCode, Smartphone, Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function HowItWorksSection() {
  const { t } = useI18n();

  const steps = [
    {
      icon: QrCode,
      number: "1",
      title: t("howItWorks.step1.title"),
      description: t("howItWorks.step1.desc"),
    },
    {
      icon: Smartphone,
      number: "2",
      title: t("howItWorks.step2.title"),
      description: t("howItWorks.step2.desc"),
    },
    {
      icon: Heart,
      number: "3",
      title: t("howItWorks.step3.title"),
      description: t("howItWorks.step3.desc"),
    },
  ];

  return (
    <section 
      id="how-it-works" 
      className="section-padding relative overflow-hidden bg-section"
    >
      {/* Technical Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(148, 163, 184, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(ellipse 85% 70% at 50% 50%, black 50%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 70% at 50% 50%, black 50%, transparent 100%)',
        }}
      />
      
      {/* Subtle gradient */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at 70% 50%, hsl(var(--primary) / 0.04) 0%, transparent 55%)',
          filter: 'blur(100px)',
        }}
      />
      
      <div className="section-container relative z-10">
        <h2 
          className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-10 md:mb-14 text-center tracking-tight text-slate-900 dark:text-slate-50"
          style={{ letterSpacing: '-0.04em' }}
        >
          {t("howItWorks.title")}
        </h2>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={step.number} 
              className="text-center relative animate-fade-in-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px" style={{ background: 'linear-gradient(to right, rgba(148,163,184,0.4), transparent)' }} />
              )}
              
              <div 
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-5 relative z-10 group bg-card border border-border shadow-premium"
                style={{ transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-premium-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-premium)'; }}
              >
                <step.icon 
                  className="w-7 h-7 md:w-8 md:h-8 group-hover:scale-110" 
                  style={{ 
                    color: 'hsl(var(--primary))',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </div>
              
              <span 
                className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold mb-3 text-white"
                style={{ backgroundColor: 'hsl(var(--primary))' }}
              >
                {step.number}
              </span>
              
              <h3 className="font-heading font-semibold mb-2 text-base sm:text-lg text-slate-900 dark:text-slate-100">
                {step.title}
              </h3>
              <p className="text-slate-800 dark:text-slate-300 text-[15px] sm:text-base">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}