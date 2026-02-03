import { Link } from "react-router-dom";
import { Instagram, Twitter, Linkedin, Mail, Coffee, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t, language } = useI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="text-slate-800"
      style={{
        background: 'linear-gradient(180deg, #1E293B 0%, #0f172a 100%)',
        transition: 'background 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Mission Statement - Top Section - 2 Column Layout */}
      <div
        className="py-10 sm:py-14 bg-[#FAFBFC] dark:bg-slate-900/70 text-slate-800 dark:text-slate-200 border-b border-slate-200/60 dark:border-slate-700/50"
        style={{ transition: 'background-color 0.5s, color 0.5s, border-color 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        <div className="section-container max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
            {/* Left Column - Built By Kaffiy */}
            <div className="text-center md:text-left">
              <h2
                className="text-2xl md:text-3xl font-heading font-bold mb-4 tracking-tight text-slate-900"
              >
                {language === "tr" ? "Kaffiy tarafından geliştirildi" : "Developed by Kaffiy"}
              </h2>
              <p
                className="text-base leading-relaxed mb-4 text-slate-700 dark:text-slate-300"
              >
                {language === "tr"
                  ? "Kaffiy, çevrimdışı işletmeler için basit, insan odaklı sistemler geliştiren otomasyon odaklı bir şirkettir."
                  : "Kaffiy is an automation-focused company that develops simple, human-centered systems for offline businesses."}
              </p>
              <p
                className="text-base leading-relaxed mb-6 text-slate-700 dark:text-slate-300"
              >
                {language === "tr"
                  ? "Teknolojinin karmaşıklık eklemek yerine sürtünmeyi azaltması gerektiğine inanıyoruz."
                  : "We believe technology should reduce friction instead of adding complexity."}
              </p>
              <Link
                to="/about"
                className="inline-flex items-center font-semibold transition-all group"
                style={{
                  color: 'hsl(var(--primary))',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {language === "tr" ? "Hakkımızda daha fazla bilgi →" : "Learn more about us →"}
              </Link>
            </div>

            {/* Right Column - Mission */}
            <div className="text-center md:text-left">
              <h2
                className="text-2xl md:text-3xl font-heading font-bold mb-4 tracking-tight text-slate-900 dark:text-slate-100"
              >
                {t("footer.missionTitle")}
              </h2>
              <p
                className="text-base leading-relaxed mb-6 text-slate-700 dark:text-slate-300"
              >
                {t("footer.missionText")}
              </p>
              <Link
                to="/about"
                className="inline-flex items-center font-semibold transition-all group"
                style={{
                  color: 'hsl(var(--primary))',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {t("footer.missionLink")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="section-container">
        {/* Main Footer Content */}
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 lg:gap-8">
            {/* Brand & Description */}
            <div className="lg:col-span-1">
              <Link to="/" className="mb-4 inline-block">
                <span className="text-2xl font-bold text-white tracking-tight">kaffiy</span>
              </Link>
              <p className="text-slate-300 text-sm leading-relaxed mb-6 max-w-xs">
                {t("footer.tagline")}
              </p>
              <p className="text-slate-400 text-xs leading-relaxed">
                {t("footer.description")}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-base">
                {t("footer.quickLinks")}
              </h4>
              <div className="flex flex-col gap-1">
                <Link
                  to="/"
                  className="text-slate-300 hover:text-white transition-colors text-sm py-2 -my-1"
                >
                  {t("nav.home")}
                </Link>
                <Link
                  to="/#how-it-works"
                  className="text-slate-300 hover:text-white transition-colors text-sm py-2 -my-1"
                >
                  {t("nav.howItWorks")}
                </Link>
                <Link
                  to="/about"
                  className="text-slate-300 hover:text-white transition-colors text-sm py-2 -my-1"
                >
                  {t("nav.about")}
                </Link>
                <Link
                  to="/contact"
                  className="text-slate-300 hover:text-white transition-colors text-sm py-2 -my-1"
                >
                  {t("footer.contact")}
                </Link>
              </div>
            </div>

            {/* Legal & Support */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-base">
                {t("footer.legal")}
              </h4>
              <div className="flex flex-col gap-1">
                <Link
                  to="/privacy"
                  className="text-slate-300 hover:text-white transition-colors text-sm py-2 -my-1"
                >
                  {t("footer.privacy")}
                </Link>
                <a
                  href="mailto:team.kaffiy@gmail.com"
                  className="text-slate-300 hover:text-white transition-colors text-sm flex items-center gap-2 py-2 -my-1"
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  {t("footer.email")}
                </a>
                <a
                  href="mailto:team.kaffiy@gmail.com"
                  className="text-slate-300 hover:text-white transition-colors text-sm py-2 -my-1 break-all"
                >
                  team.kaffiy@gmail.com
                </a>
                <a
                  href="https://wa.me/905355617222"
                  className="text-slate-300 hover:text-white transition-colors text-sm py-2 -my-1"
                >
                  WhatsApp: +90 535 561 7222
                </a>
              </div>
            </div>

            {/* Social Media & Contact */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-base">
                {t("footer.social")}
              </h4>
              <div className="flex gap-3 mb-6">
                <div
                  className="w-11 h-11 rounded-xl bg-white/[0.04] flex items-center justify-center border border-white/[0.04] opacity-30 cursor-not-allowed"
                  aria-label="Instagram (Coming Soon)"
                >
                  <Instagram className="w-5 h-5 text-slate-400" />
                </div>
                <div
                  className="w-11 h-11 rounded-xl bg-white/[0.04] flex items-center justify-center border border-white/[0.04] opacity-30 cursor-not-allowed"
                  aria-label="Twitter (Coming Soon)"
                >
                  <Twitter className="w-5 h-5 text-slate-400" />
                </div>
                <div
                  className="w-11 h-11 rounded-xl bg-white/[0.04] flex items-center justify-center border border-white/[0.04] opacity-30 cursor-not-allowed"
                  aria-label="LinkedIn (Coming Soon)"
                >
                  <Linkedin className="w-5 h-5 text-slate-400" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-slate-400 text-xs">
                  {language === "tr" ? "İstanbul, Türkiye" : "Istanbul, Turkey"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-white/[0.08]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm text-center md:text-left">
              {t("footer.copyright")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}