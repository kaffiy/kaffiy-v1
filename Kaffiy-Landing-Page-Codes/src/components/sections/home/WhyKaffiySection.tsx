import React from "react";
import { CreditCard, Unplug, BarChart3 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function WhyKaffiySection() {
  const { t } = useI18n();

  const cards = [
    {
      icon: CreditCard,
      title: t("whyKaffiy.card1.title"),
      description: t("whyKaffiy.card1.desc"),
    },
    {
      icon: Unplug,
      title: t("whyKaffiy.card2.title"),
      description: t("whyKaffiy.card2.desc"),
    },
    {
      icon: BarChart3,
      title: t("whyKaffiy.card3.title"),
      description: t("whyKaffiy.card3.desc"),
    },
  ];

  return (
    <section 
      className="section-padding relative overflow-hidden bg-section"
    >
      {/* Subtle warm gradient */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at 30% 50%, hsl(var(--primary) / 0.04) 0%, transparent 55%)',
          filter: 'blur(100px)',
        }}
      />
      
      <div className="section-container relative z-10">
        <h2 
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-8 md:mb-12 text-center tracking-tight text-slate-900 dark:text-slate-50"
          style={{ letterSpacing: '-0.04em' }}
        >
          {t("whyKaffiy.title")}
        </h2>

        {/* Bento Grid Layout - Asymmetric */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 max-w-6xl mx-auto">
          {/* Card 1 - 2 columns wide */}
          <div
            className="group md:col-span-2 p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-3xl animate-fade-in-up bg-card border border-border shadow-premium"
            style={{ animationDelay: '0s', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-premium-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-premium)'; }}
          >
            <div 
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-105"
              style={{
                backgroundColor: 'hsl(var(--primary) / 0.07)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {React.createElement(cards[0].icon, { className: "w-6 h-6 sm:w-7 sm:h-7", style: { color: 'hsl(var(--primary))' } })}
            </div>
            <h3 
              className="font-heading font-semibold text-lg sm:text-xl mb-2 sm:mb-3 text-slate-900 dark:text-slate-100"
              style={{ letterSpacing: '-0.04em' }}
            >
              {cards[0].title}
            </h3>
            <p className="leading-relaxed text-slate-800 dark:text-slate-300 text-[15px] sm:text-base">
              {cards[0].description}
            </p>
          </div>

          {/* Card 2 - 1 column */}
          <div
            className="group p-6 sm:p-8 md:p-9 rounded-2xl md:rounded-3xl animate-fade-in-up bg-card border border-border shadow-premium"
            style={{ animationDelay: '0.1s', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-premium-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-premium)'; }}
          >
            <div 
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-105"
              style={{
                backgroundColor: 'hsl(var(--primary) / 0.07)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {React.createElement(cards[1].icon, { className: "w-6 h-6 sm:w-7 sm:h-7", style: { color: 'hsl(var(--primary))' } })}
            </div>
            <h3 
              className="font-heading font-semibold text-lg sm:text-xl mb-2 sm:mb-3 text-slate-900 dark:text-slate-100"
              style={{ letterSpacing: '-0.04em' }}
            >
              {cards[1].title}
            </h3>
            <p className="leading-relaxed text-slate-800 dark:text-slate-300 text-[15px] sm:text-base">
              {cards[1].description}
            </p>
          </div>

          {/* Card 3 - 1 column */}
          <div
            className="group p-6 sm:p-8 md:p-9 rounded-2xl md:rounded-3xl animate-fade-in-up bg-card border border-border shadow-premium"
            style={{ animationDelay: '0.2s', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-premium-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-premium)'; }}
          >
            <div 
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-4 sm:mb-5 group-hover:scale-105"
              style={{
                backgroundColor: 'hsl(var(--primary) / 0.07)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {React.createElement(cards[2].icon, { className: "w-6 h-6 sm:w-7 sm:h-7", style: { color: 'hsl(var(--primary))' } })}
            </div>
            <h3 
              className="font-heading font-semibold text-lg sm:text-xl mb-2 sm:mb-3 text-slate-900 dark:text-slate-100"
              style={{ letterSpacing: '-0.04em' }}
            >
              {cards[2].title}
            </h3>
            <p className="leading-relaxed text-slate-800 dark:text-slate-300 text-[15px] sm:text-base">
              {cards[2].description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}