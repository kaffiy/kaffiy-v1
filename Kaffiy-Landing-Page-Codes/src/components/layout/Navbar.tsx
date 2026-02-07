import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Moon, Sun, Globe, LogIn, User, Coffee, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { useThemeMode } from "@/hooks/use-theme";
import { AnnouncementBar } from "./AnnouncementBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t, language, setLanguage } = useI18n();
  const { isDark, setIsDark } = useThemeMode();

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/#how-it-works", label: t("nav.howItWorks") },
    { href: "/about", label: t("nav.about") },
    { href: "/contact", label: t("nav.contact") },
  ];

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    if (href.includes("#")) {
      const element = document.querySelector(href.replace("/", ""));
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b bg-white/80 dark:bg-slate-900/90 border-slate-200/60 dark:border-slate-700/50 shadow-[0_1px_0_0_rgba(255,255,255,0.6)_inset] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]"
      style={{ transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
      <AnnouncementBar />
      <nav className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo className="h-7 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => handleNavClick(link.href)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium",
                  location.pathname === link.href
                    ? "text-primary bg-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
                style={{
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  ...(location.pathname !== link.href
                    ? { color: 'hsl(var(--muted-foreground))' }
                    : {}),
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Dark toggle + Language + CTA - Desktop */}
          <div className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg"
              onClick={() => setIsDark(!isDark)}
              aria-label={isDark ? "Açık tema" : "Koyu tema"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg"
              onClick={() => setLanguage(language === "tr" ? "en" : "tr")}
              aria-label="Change language"
            >
              <Globe className="w-4 h-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="gap-2 h-9 px-3 rounded-lg text-sm font-medium hover:bg-accent/50"
                >
                  <LogIn className="w-4 h-4" />
                  {t("nav.login")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border-slate-200/60 dark:border-slate-700/50 shadow-xl">
                <DropdownMenuItem className="rounded-lg py-2.5 cursor-pointer focus:bg-primary/5" asChild>
                  <a href="https://kaffiyuserui.netlify.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 w-full">
                    <User className="w-4 h-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{t("nav.userApp")}</span>
                    </div>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg py-2.5 cursor-pointer focus:bg-primary/5" asChild>
                  <a href="https://kaffiyclientui.netlify.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 w-full">
                    <Coffee className="w-4 h-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{t("nav.staffApp")}</span>
                    </div>
                  </a>
                </DropdownMenuItem>
                <div className="h-px bg-slate-200/60 dark:bg-slate-700/50 my-1 mx-1" />
                <DropdownMenuItem className="rounded-lg py-2.5 cursor-pointer focus:bg-primary/5" asChild>
                  <a href="https://kaffiy-dashboard.netlify.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 w-full">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{t("nav.management")}</span>
                    </div>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              asChild
              className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
              style={{
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 4px 14px -2px hsl(var(--primary) / 0.28)',
              }}
            >
              <Link to="/contact">{t("nav.startPilot")}</Link>
            </Button>
          </div>

          {/* Mobile Menu Button - min 44px touch target */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-accent active:bg-accent/80"
            style={{
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div
            className="md:hidden py-4 border-t border-slate-200/60 dark:border-slate-700/50 bg-white/95 dark:bg-slate-900/98 backdrop-blur-md"
            style={{ transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))' }}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between px-4 py-2 md:hidden min-h-[44px]">
                <span className="text-sm text-muted-foreground">{isDark ? "Koyu" : "Açık"} tema</span>
                <Button variant="ghost" size="sm" className="h-10 min-h-[44px] min-w-[44px] gap-1.5" onClick={() => setIsDark(!isDark)}>
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
              </div>

              <div className="flex items-center justify-between px-4 py-2 md:hidden min-h-[44px]">
                <span className="text-sm text-muted-foreground">Dil</span>
                <Button variant="ghost" size="sm" className="h-10 min-h-[44px] min-w-[44px] gap-1.5" onClick={() => setLanguage(language === "tr" ? "en" : "tr")}>
                  <Globe className="w-4 h-4" />
                  <span className="text-xs font-medium">{language === "tr" ? "EN" : "TR"}</span>
                </Button>
              </div>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={cn(
                    "px-4 py-3.5 min-h-[44px] flex items-center rounded-lg text-sm font-medium",
                    location.pathname === link.href
                      ? "text-primary bg-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                  style={{
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {link.label}
                </Link>
              ))}

              <div className="h-px bg-slate-200/60 dark:bg-slate-700/50 my-2 mx-4" />

              <a
                href="https://kaffiyuserui.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3.5 flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <User className="w-4 h-4 text-primary" />
                {t("nav.userApp")}
              </a>
              <a
                href="https://kaffiyclientui.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3.5 flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <Coffee className="w-4 h-4 text-primary" />
                {t("nav.staffApp")}
              </a>
              <a
                href="https://kaffiy-dashboard.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3.5 flex items-center gap-3 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <ShieldCheck className="w-4 h-4 text-primary" />
                {t("nav.management")}
              </a>

              <div className="pt-3 px-4">
                <Button
                  className="w-full min-h-[48px] rounded-xl bg-primary text-primary-foreground"
                  style={{
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  asChild
                >
                  <Link to="/contact" onClick={() => setIsOpen(false)}>
                    {t("nav.startPilot")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
