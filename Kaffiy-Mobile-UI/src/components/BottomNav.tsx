import { QrCode, User } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: "qr" | "profile";
  onTabChange: (tab: "qr" | "profile") => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around py-2 px-4">
        <Button
          variant="bottom-nav"
          size="bottom-nav"
          data-active={activeTab === "qr"}
          onClick={() => onTabChange("qr")}
          className={cn(
            "flex-1",
            activeTab === "qr" && "text-primary"
          )}
        >
          <div className={cn(
            "p-2 rounded-xl transition-colors",
            activeTab === "qr" ? "bg-primary/10" : "bg-transparent"
          )}>
            <QrCode className="w-6 h-6" />
          </div>
          <span>QR Aç</span>
        </Button>
        
        <Button
          variant="bottom-nav"
          size="bottom-nav"
          data-active={activeTab === "profile"}
          onClick={() => onTabChange("profile")}
          className={cn(
            "flex-1",
            activeTab === "profile" && "text-primary"
          )}
        >
          <div className={cn(
            "p-2 rounded-xl transition-colors",
            activeTab === "profile" ? "bg-primary/10" : "bg-transparent"
          )}>
            <User className="w-6 h-6" />
          </div>
          <span>Profil</span>
        </Button>
      </div>
    </nav>
  );
};

export default BottomNav;
