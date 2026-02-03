interface HalicKahveLogoProps {
  className?: string;
  size?: number;
}

export const HalicKahveLogo = ({ 
  className = "", 
  size = 40
}: HalicKahveLogoProps) => {
  return (
    <div 
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background circle - black */}
        <circle cx="50" cy="50" r="50" fill="#000000" />
        
        {/* White C letter - thick rounded */}
        <path
          d="M 30 25
             C 20 25, 15 30, 15 40
             L 15 60
             C 15 70, 20 75, 30 75
             L 50 75
             C 60 75, 65 70, 65 60
             L 65 50
             L 65 40
             C 65 30, 60 25, 50 25
             Z"
          fill="#FFFFFF"
        />
        
        {/* Red bar extending from C */}
        <rect
          x="75"
          y="40"
          width="18"
          height="20"
          fill="#DC2626"
          rx="1"
        />
      </svg>
    </div>
  );
};
