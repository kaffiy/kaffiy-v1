import { cn } from "@/lib/utils";

export const KaffiyLogo = ({ className }: { className?: string }) => {
  return (
    <img
      src="/kaffiy logo white.png"
      alt="Kaffiy"
      className={cn("h-8 w-auto object-contain", className)}
    />
  );
};

export const KaffiyLogoIcon = ({ className }: { className?: string }) => {
  return (
    <img
      src="/kaffiy logo white.png"
      alt="Kaffiy"
      className={cn("h-6 w-6 object-contain", className)}
    />
  );
};

export const KaffiyLogoMark = ({ className }: { className?: string }) => {
  return (
    <img
      src="/kaffiy logo white.png"
      alt="Kaffiy"
      className={cn("h-5 w-5 object-contain", className)}
    />
  );
};
