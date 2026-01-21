import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { ArrowRight } from "lucide-react";

export function AboutSection() {
  const { t } = useI18n();

  return (
    <section 
      className="section-padding relative overflow-hidden"
      style={{
        background: '#F8FAFC',
        transition: 'background 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Subtle theme-colored gradient */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, hsl(var(--primary) / 0.05) 0%, transparent 60%)`,
          filter: 'blur(100px)',
          transition: 'background 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
      
      <div className="section-container relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg leading-relaxed mb-4 text-slate-800">
            {t("about.p1")}
          </p>

          <p className="leading-relaxed mb-8 text-slate-800">
            {t("about.p2")}
          </p>

          <Link 
            to="/about" 
            className="inline-flex items-center gap-2 font-medium hover:gap-3 group"
            style={{
              color: 'hsl(var(--primary))',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {t("about.learnMore")}
            <ArrowRight 
              className="w-4 h-4 group-hover:translate-x-1" 
              style={{
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}