import { useI18n } from "@/lib/i18n";
import dashboardImage from "@/assets/kaffiy-admin-dashboard-16-01-2026.png";
import kaffiyTebrikler from "@/assets/kaffiy-tebrikler.png";

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

          {/* Dashboard + Telefon yan yana, ortalı */}
          <div className="animate-fade-in-up flex flex-col md:flex-row items-center justify-center gap-5 sm:gap-6 md:gap-8 lg:gap-10">
            {/* Dashboard */}
            <div 
              className="rounded-2xl md:rounded-3xl overflow-hidden bg-card w-full max-w-2xl md:max-w-3xl flex-shrink-0 border border-border shadow-premium"
            >
              <img 
                src={dashboardImage} 
                alt="Kaffiy Dashboard - Kafe sahipleri için gerçek zamanlı analitik paneli, QR ve ödül istatistikleri, kampanyalar, canlı akış" 
                className="w-full h-auto"
                loading="eager"
              />
            </div>

            {/* Telefon mockup - mobilde biraz daha büyük */}
            <div 
              className="relative rounded-[2.5rem] p-[5px] shadow-2xl bg-gradient-to-b from-slate-800 via-slate-900 to-black flex-shrink-0"
              style={{ 
                width: 'clamp(110px, 28vw, 140px)',
                boxShadow: '0 20px 50px hsl(var(--primary) / 0.15), 0 10px 25px hsl(var(--primary) / 0.1), 0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.3)',
              }}
            >
              <div className="absolute -inset-1 rounded-[2.5rem] opacity-30 blur-xl" style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 70%)' }} />
              <div className="absolute inset-[5px] rounded-[2.1rem] pointer-events-none z-30" style={{ boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.4), inset 0 -1px 4px rgba(255, 255, 255, 0.1)' }} />
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-40 rounded-full bg-black/95 backdrop-blur-md w-7 h-1.5" style={{ boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.5), 0 0 0 0.5px rgba(255, 255, 255, 0.08), 0 2px 4px rgba(0, 0, 0, 0.3)' }} />
              <div className="relative rounded-[2.1rem] overflow-hidden bg-white shadow-inner" style={{ boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.05)' }}>
                <img src={kaffiyTebrikler} alt="Tebrikler Ekranı" className="w-full h-auto" />
                <div className="absolute inset-0 pointer-events-none z-10" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 40%, rgba(0,0,0,0.05) 100%)' }} />
              </div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-40 rounded-full bg-white/60 backdrop-blur-md w-10 h-1" style={{ boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.3)' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
