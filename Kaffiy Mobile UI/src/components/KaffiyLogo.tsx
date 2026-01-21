interface KaffiyLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showAccent?: boolean;
  variant?: "light" | "dark"; // light = dark text on light bg, dark = light text on dark bg
}

const sizeMap = {
  sm: { width: 80, height: 24 },
  md: { width: 100, height: 30 },
  lg: { width: 140, height: 42 },
};

export const KaffiyLogo = ({ 
  className = "", 
  size = "md",
  showAccent = true 
}: KaffiyLogoProps) => {
  const { width, height } = sizeMap[size];
  
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Kaffiy logo"
    >
      {/* k */}
      <path
        d="M0 6h3.5v8.2l5.8-8.2h4.2l-6.2 8.3 6.8 9.7h-4.4l-6.2-9.2v9.2H0V6z"
        fill="#1E293B"
      />
      {/* a */}
      <path
        d="M16.5 14.8c0-5.4 3.2-9.2 7.8-9.2 2.4 0 4.2 1 5.2 2.6V6h3.4v18h-3.4v-2.2c-1 1.6-2.8 2.6-5.2 2.6-4.6 0-7.8-3.8-7.8-9.2v-.4zm13 .2c0-3.6-2-6-4.8-6s-4.8 2.4-4.8 6 2 6 4.8 6 4.8-2.4 4.8-6z"
        fill="#1E293B"
      />
      {/* ff ligature - tightly kerned */}
      <path
        d="M36 10.4V6h3.2v4.4h-3.2zm0 13.6V11.6h3.2V24H36zM35.8 6c0-3.8 2-5.6 5.2-5.6v3c-1.4 0-2 .8-2 2.2V6h-3.2z"
        fill="#1E293B"
      />
      <path
        d="M41.5 10.4V6h3.2v4.4h-3.2zm0 13.6V11.6h3.2V24h-3.2zM41.3 6c0-3.8 2-5.6 5.2-5.6v3c-1.4 0-2 .8-2 2.2V6h-3.2z"
        fill="#1E293B"
      />
      {/* i */}
      <path
        d="M50 11.6h3.2V24H50V11.6z"
        fill="#1E293B"
      />
      {/* y */}
      <path
        d="M57 11.6h3.5l4 9.6 4-9.6h3.5l-6.4 15c-1.2 2.8-2.8 4-5.4 4v-3c1.4 0 2.2-.6 2.8-2l.4-.8-6.4-13.2z"
        fill="#1E293B"
      />
    </svg>
  );
};

// Text-based version using web fonts (alternative)
export const KaffiyLogoText = ({ 
  className = "", 
  size = "md",
  showAccent = true,
  variant
}: KaffiyLogoProps) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl", 
    lg: "text-3xl",
  };

  // Use CSS classes for dark mode instead of JavaScript detection
  // This is more reliable and works with SSR
  const textColorClass = variant === "dark" 
    ? "text-white" 
    : variant === "light"
    ? "text-slate-800"
    : "text-slate-800 dark:text-white";
  
  const accentColorLight = "#D97706"; // Orange for light mode
  const accentColorDark = "#EF4444"; // Red for dark mode

  return (
    <span 
      className={`font-bold tracking-tight ${sizeClasses[size]} ${textColorClass} dark:drop-shadow-sm ${className}`}
      style={{ 
        fontFamily: "'DM Sans', system-ui, sans-serif",
        letterSpacing: '-0.03em'
      }}
      aria-label="Kaffiy"
    >
      kaffiy
    </span>
  );
};
