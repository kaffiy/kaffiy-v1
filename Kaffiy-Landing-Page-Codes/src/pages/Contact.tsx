import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LeadFormSection } from "@/components/sections/home/LeadFormSection";

export default function Contact() {
  const { t } = useI18n();

  return (
    <Layout>
      {/* Pre-registration Form Section - Moved to Top */}
      <LeadFormSection />

      {/* Hero / Contact Card */}
      <section
        className="section-padding relative overflow-hidden transition-colors duration-500 bg-slate-50 dark:bg-slate-950 pb-24"
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
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 sm:mb-6 tracking-tight text-slate-800 dark:text-slate-100" style={{ letterSpacing: '-0.02em' }}>
              {t("contact.title")}
            </h1>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed mb-8 sm:mb-10 text-slate-600 dark:text-slate-300">
              {t("contact.subtitle")}
            </p>

            <div
              className="rounded-2xl border p-5 sm:p-6 md:p-8 lg:p-10 shadow-lg text-center transition-all duration-500 backdrop-blur-sm bg-white/80 dark:bg-slate-900/70 border-slate-200/60 dark:border-slate-700/60 max-w-lg mx-auto"
              style={{
                boxShadow: `0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.04), 0 0 40px hsl(var(--primary) / 0.1)`,
              }}
            >
              <div className="w-16 h-16 rounded-2xl bg-[#25D366]/10 flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-[#25D366]" />
              </div>
              <h2 className="font-heading font-bold text-xl mb-3 text-slate-800 dark:text-slate-100">
                {t("contact.cardTitle")}
              </h2>
              <p className="mb-8 leading-relaxed text-slate-600 dark:text-slate-300">
                {t("contact.cardDesc")}
              </p>

              {/* Primary Action - WhatsApp */}
              <div className="space-y-4">
                <Button
                  asChild
                  size="lg"
                  className="w-full h-14 bg-[#25D366] text-white hover:bg-[#20BA5A] rounded-xl text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <a href="https://wa.me/905355617222" target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    {t("contact.button")}
                  </a>
                </Button>

                {/* Alternative - Email */}
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t("contact.emailAlt")}
                </p>
              </div>
            </div>

            <p className="text-sm mt-8 leading-relaxed text-slate-500 dark:text-slate-400">
              {t("contact.note")}
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
