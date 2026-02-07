import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useI18n } from "@/lib/i18n";
import dashboardImage from "@/assets/kaffiy-admin-dashboard-16-01-2026.png";
import { Button } from "@/components/ui/button";

export function DashboardPreviewSection() {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Sayfa 1440px genişliğe göre render edilecek, konteynere sığması için ölçekliyoruz
        const newScale = containerWidth / 1440;
        setScale(newScale);
      }
    };

    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    updateScale();
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <section
      className="section-padding relative overflow-hidden bg-section"
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

      <div className="section-container relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 sm:mb-6 tracking-tight text-slate-900 dark:text-slate-50"
              style={{
                letterSpacing: '-0.04em',
              }}
            >
              {t("dashboard.title")}
            </h2>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl mx-auto text-slate-800 dark:text-slate-300 px-1">
              {t("dashboard.desc")}
            </p>
          </div>



          {/* Live Previews */}
          <div className="animate-fade-in-up grid gap-6 md:gap-8 max-w-6xl xl:max-w-7xl mx-auto w-full">
            {/* Masaüstü dashboard: Artık her cihazda görünüyor ve desktop görünümüne zorlanıyor */}
            <div className="block">
              <div className="mb-3 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                Kafe Sahibi Dashboard (Masaüstü)
              </div>
              <div
                ref={containerRef}
                className="relative rounded-2xl md:rounded-3xl bg-card w-full border border-border shadow-premium p-3 sm:p-4 overflow-hidden"
              >
                {/* 16:9 Aspect Ratio Container */}
                <div
                  className="relative w-full rounded-xl bg-slate-900/5 dark:bg-slate-950/40"
                  style={{ paddingBottom: '56.25%' }}
                >
                  {/* Scaling Wrapper */}
                  <div
                    className="absolute top-0 left-0 origin-top-left"
                    style={{
                      width: '1440px',
                      height: '810px',
                      transform: `scale(${scale})`,
                      // Pointer events fix for scaled iframes
                    }}
                  >
                    <div className="relative">
                      <div
                        className="relative overflow-hidden rounded-2xl shadow-2xl group cursor-pointer"
                        style={{
                          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: `scale(${scale})`,
                          transformOrigin: 'top center',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = `scale(${scale * 1.02})`;
                          e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = `scale(${scale})`;
                          e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.15)';
                        }}
                      >
                        {/* Overlay gradient for better text visibility */}
                        <div
                          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{
                            background: 'linear-gradient(to top, rgba(0,0,0,0.1) 0%, transparent 50%)',
                          }}
                        />

                        <img
                          src={dashboardImage}
                          alt="Kaffiy Dashboard - Müşteri analitiği ve sadakat yönetimi paneli"
                          className="w-full h-auto object-cover"
                          loading="lazy"
                        />

                        {/* Interactive elements overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute top-1/4 left-1/3 w-32 h-8 bg-primary/10 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute top-1/2 right-1/4 w-24 h-6 bg-primary/10 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ animationDelay: '0.2s' }} />
                          <div className="absolute bottom-1/3 left-1/2 w-28 h-6 bg-primary/10 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ animationDelay: '0.4s' }} />
                        </div>
                      </div>

                      {/* Reflection effect */}
                      <div
                        className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-t-2xl"
                        style={{ transform: 'translateY(-100%)' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:gap-8 md:grid-cols-2">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Müşteri Mobil Arayüzü (QR)
                  </div>
                  <Button variant="link" size="sm" className="h-auto p-0 text-primary text-xs" asChild>
                    <a href="https://kaffiyuserui.netlify.app" target="_blank" rel="noopener noreferrer">Hemen Dene →</a>
                  </Button>
                </div>
                <div className="relative rounded-2xl bg-card w-full border border-border shadow-premium py-3 sm:py-4 px-0 flex justify-center group/app transition-all hover:border-primary/30">
                  <div className="aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-[28px] bg-slate-900/5 dark:bg-slate-950/40 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] relative">
                    <iframe
                      title="Kaffiy Müşteri Mobil Arayüzü"
                      src="https://kaffiyuserui.netlify.app/"
                      className="h-full w-full"
                      loading="lazy"
                      allow="fullscreen; clipboard-write"
                      style={{ colorScheme: "light" }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                    İşletme Takip Paneli (Süreç Takibi)
                  </div>
                  <Button variant="link" size="sm" className="h-auto p-0 text-primary text-xs" asChild>
                    <a href="https://kaffiyclientui.netlify.app" target="_blank" rel="noopener noreferrer">Hemen Dene →</a>
                  </Button>
                </div>
                <div className="relative rounded-2xl bg-card w-full border border-border shadow-premium py-3 sm:py-4 px-0 flex justify-center group/app transition-all hover:border-primary/30">
                  <div className="aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-[28px] bg-slate-900/5 dark:bg-slate-950/40 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)] relative">
                    <iframe
                      title="Kaffiy Barista Arayüzü"
                      src="https://kaffiyclientui.netlify.app/"
                      className="h-full w-full"
                      loading="lazy"
                      allow="fullscreen; clipboard-write"
                      style={{ colorScheme: "dark" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
