import React from "react";
import { useI18n } from "@/lib/i18n";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "h-10 w-auto" }: LogoProps) {
  const { t } = useI18n();
  
  return (
    <div className="flex flex-col items-start">
      <img 
        src="/kaffiy-logo-transparent.png"
        alt="Kaffiy Logo" 
        className={className}
        style={{
          filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.05))',
        }}
      />
      <span
        className="text-[9px] font-light tracking-wide"
        style={{
          marginTop: "1px",
          color: 'hsl(var(--muted-foreground))',
          letterSpacing: '0.05em',
          opacity: 0.7,
        }}
      >
        {t("logo.subtitle")}
      </span>
    </div>
  );
}

