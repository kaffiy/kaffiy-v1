import { ExternalLink } from "lucide-react";
import { KaffiyLogoText } from "./KaffiyLogo";

const PoweredByFooter = () => {
  return (
    <div className="py-3 px-6 text-center">
      <a
        href="https://kaffiy.com"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground/50 hover:text-muted-foreground/70 transition-colors"
      >
        <span>Powered by</span>
        <KaffiyLogoText size="sm" showAccent className="!text-[10px] !leading-none" />
        <span className="mx-0.5">•</span>
        <span className="flex items-center gap-0.5 hover:underline">
          Siz de kullanın
          <ExternalLink className="w-2.5 h-2.5" />
        </span>
      </a>
    </div>
  );
};

export default PoweredByFooter;
