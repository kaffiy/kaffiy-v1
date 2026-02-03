import { useI18n } from "@/lib/i18n";
import dashboardImage from "@/assets/kaffiy-admin-dashboard-16-01-2026.png";
export function DashboardPreviewSection() {
  const { t } = useI18n();

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

          {/* Static Dashboard Image - Hidden on mobile */}
          <div className="animate-fade-in-up md:flex items-center justify-center mb-10 md:mb-12 hidden">
            <div className="w-full max-w-5xl xl:max-w-6xl">
              <div className="mb-3 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                Dashboard Önizlemesi
              </div>
              <div className="relative rounded-2xl md:rounded-3xl bg-card w-full flex-shrink-0 border border-border shadow-premium p-3 sm:p-4">
                <img
                  src={dashboardImage}
                  alt="Kaffiy Dashboard - Kurumsal veri paneli, performans metrikleri ve akıllı kampanya içgörüleri"
                  className="w-full h-auto rounded-xl"
                  loading="eager"
                />
              </div>
            </div>
          </div>

          {/* Live Previews */}
          <div className="animate-fade-in-up grid gap-6 md:gap-8 max-w-6xl xl:max-w-7xl mx-auto w-full">
            {/* Masaüstü dashboard: mobilde gizle (küçük ekranda barista görünümü oluyor) */}
            <div className="hidden md:block">
              <div className="mb-3 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                Kafe Sahibi Dashboard (Masaüstü)
              </div>
              <div className="relative rounded-2xl md:rounded-3xl bg-card w-full border border-border shadow-premium p-3 sm:p-4">
                <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-900/5 dark:bg-slate-950/40">
                  <iframe
                    title="Kaffiy Dashboard - Masaüstü"
                    src="https://kaffiyclientui.netlify.app/"
                    className="h-full w-full"
                    loading="lazy"
                    allow="fullscreen; clipboard-write"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:gap-8 md:grid-cols-2">
              <div>
                <div className="mb-3 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Müşteri Mobil Arayüzü (QR)
                </div>
                <div className="relative rounded-2xl bg-card w-full border border-border shadow-premium py-3 sm:py-4 px-0 flex justify-center">
                  <div className="aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-[28px] bg-slate-900/5 dark:bg-slate-950/40 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)]">
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
                <div className="mb-3 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Barista Mobil Arayüzü
                </div>
                <div className="relative rounded-2xl bg-card w-full border border-border shadow-premium py-3 sm:py-4 px-0 flex justify-center">
                  <div className="aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-[28px] bg-slate-900/5 dark:bg-slate-950/40 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.35)]">
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
