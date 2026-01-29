import { useI18n } from "@/lib/i18n";

// Haliç Kahve Logo SVG Component
function HalicKahveLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* White C - Bold uppercase letter with uniform stroke */}
      <path
        d="M 40 100 
           A 60 60 0 0 1 100 40
           L 100 60
           A 40 40 0 0 0 60 100
           A 40 40 0 0 0 100 140
           L 100 160
           A 60 60 0 0 1 40 100 Z"
        fill="white"
      />
      {/* Red horizontal bar extending from the open right side of C */}
      <rect
        x="100"
        y="75"
        width="35"
        height="50"
        fill="#DC2626"
      />
    </svg>
  );
}

export function PartnersSection() {
  const { t } = useI18n();

  const partners = [
    {
      name: "Haliç Kahve",
      logo: HalicKahveLogo,
      url: "https://www.instagram.com/halickahve/",
    },
  ];

  return (
    <section 
      className="section-padding relative overflow-hidden bg-section"
    >
      {/* Subtle theme-colored gradient */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, hsl(var(--primary) / 0.04) 0%, transparent 65%)`,
          filter: 'blur(100px)',
          transition: 'background 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
      
      <div className="section-container relative z-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold mb-3 sm:mb-4 text-center tracking-tight text-slate-900 dark:text-slate-50">
            {t("partners.title")}
          </h2>
          <p className="text-center mb-8 md:mb-12 text-base sm:text-lg text-slate-800 dark:text-slate-300 px-2">
            {t("partners.subtitle")}
          </p>

          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8">
            {partners.map((partner, index) => {
              const LogoComponent = partner.logo;
              const content = (
                <>
                  {LogoComponent && (
                    <div className="mb-4 w-24 h-24 bg-black rounded-xl p-3 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <LogoComponent className="w-full h-full" />
                    </div>
                  )}
                  <span className="text-xl md:text-2xl font-heading font-semibold text-foreground group-hover:text-primary transition-colors">
                    {partner.name}
                  </span>
                </>
              );

              if (partner.url) {
                return (
                  <a
                    key={index}
                    href={partner.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col items-center justify-center px-6 py-5 sm:px-8 sm:py-6 md:px-10 md:py-8 bg-card rounded-2xl md:rounded-3xl border border-border shadow-premium animate-fade-in-up cursor-pointer min-h-[44px]"
                    style={{ animationDelay: `${index * 0.1}s`, transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-premium-hover)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-premium)'; }}
                  >
                    {content}
                  </a>
                );
              }

              return (
                <div
                  key={index}
                  className="group flex flex-col items-center justify-center px-6 py-5 sm:px-8 sm:py-6 md:px-10 md:py-8 bg-card rounded-2xl md:rounded-3xl border border-border shadow-premium animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s`, transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
                >
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
