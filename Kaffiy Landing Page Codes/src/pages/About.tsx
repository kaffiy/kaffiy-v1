import { Layout } from "@/components/layout/Layout";
import { useI18n } from "@/lib/i18n";
import { Target, Heart, Lightbulb, Users } from "lucide-react";

export default function About() {
  const { t } = useI18n();

  const values = [
    {
      icon: Heart,
      title: t("about.value1.title"),
      description: t("about.value1.desc"),
    },
    {
      icon: Lightbulb,
      title: t("about.value2.title"),
      description: t("about.value2.desc"),
    },
    {
      icon: Target,
      title: t("about.value3.title"),
      description: t("about.value3.desc"),
    },
    {
      icon: Users,
      title: t("about.value4.title"),
      description: t("about.value4.desc"),
    },
  ];

  return (
    <Layout>
      {/* Hero - Story Section */}
      <section 
        className="py-16 md:py-24 relative overflow-hidden transition-colors duration-500"
        style={{
          background: '#F8FAFC',
        }}
      >
        {/* Subtle theme-colored gradient */}
        <div 
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, hsl(var(--primary) / 0.06) 0%, transparent 60%)`,
            filter: 'blur(100px)',
            transition: 'background 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
        
        <div className="section-container relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left - Typography */}
              <div>
                <h1 
                  className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 leading-tight tracking-tight text-slate-800" 
                  style={{ 
                    letterSpacing: '-0.04em',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {t("about.hero.title")}
                </h1>
              </div>

              {/* Right - Story Text */}
              <div className="space-y-6">
                <p className="text-lg leading-relaxed text-slate-600">
                  {t("about.hero.p1")}
                </p>
                <p className="text-lg leading-relaxed text-slate-600">
                  {t("about.hero.p2")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values - Grid */}
      <section 
        className="py-16 md:py-24 relative overflow-hidden transition-colors duration-500"
        style={{
          background: '#F8FAFC',
        }}
      >
        {/* Subtle theme-colored gradient */}
        <div 
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, hsl(var(--primary) / 0.04) 0%, transparent 60%)`,
            filter: 'blur(100px)',
            transition: 'background 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
        
        <div className="section-container relative z-10">
          <div className="max-w-6xl mx-auto">
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-12 text-center tracking-tight text-slate-800" 
              style={{ 
                letterSpacing: '-0.04em',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {t("about.values.title")}
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="p-8 bg-white rounded-2xl text-center backdrop-blur-sm"
                  style={{
                    border: '0.5px solid rgba(148, 163, 184, 0.3)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.04), 0 0 40px hsl(var(--primary) / 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.04)';
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{
                      backgroundColor: 'hsl(var(--primary) / 0.1)',
                    }}
                  >
                    <value.icon className="w-6 h-6" style={{ color: 'hsl(var(--primary))' }} />
                  </div>
                  <h3 
                    className="font-heading font-bold text-lg mb-3 text-slate-800"
                    style={{
                      letterSpacing: '-0.04em',
                    }}
                  >
                    {value.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section 
        className="py-16 md:py-24 relative overflow-hidden transition-colors duration-500"
        style={{
          background: '#FFFFFF',
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
          <div className="max-w-3xl mx-auto text-center">
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-6 tracking-tight text-slate-800" 
              style={{ 
                letterSpacing: '-0.04em',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {t("about.vision.title")}
            </h2>

            <p className="text-lg leading-relaxed mb-6 text-slate-600">
              {t("about.vision.p1")}
            </p>
            <p className="font-semibold text-lg leading-relaxed text-slate-800">
              {t("about.vision.p2")}
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
