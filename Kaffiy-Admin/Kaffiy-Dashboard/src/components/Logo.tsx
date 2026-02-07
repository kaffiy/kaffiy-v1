export const HalicKahveLogo = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* White C letter */}
      <path
        d="M 20 20 Q 20 10 30 10 L 70 10 Q 80 10 80 20 L 80 80 Q 80 90 70 90 L 30 90 Q 20 90 20 80 Z"
        fill="white"
        stroke="none"
      />
      {/* Red bar inside C */}
      <rect x="65" y="35" width="15" height="30" fill="#DC2626" rx="2" />
    </svg>
  );
};
