import { useState } from "react";
import { X, Mail } from "lucide-react";

export function AnnouncementBar() {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div
            className="relative z-[60] bg-indigo-600 text-white px-4 py-2 text-sm font-medium transition-all duration-300"
            style={{
                background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)',
            }}
        >
            <div className="section-container relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 justify-center w-full sm:w-auto mx-auto sm:mx-0">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                        <Mail className="h-4 w-4" />
                    </span>
                    <p className="text-center sm:text-left text-xs sm:text-sm leading-tight">
                        <span className="opacity-80 block sm:inline mr-1">Önemli:</span>
                        İletişim adresimizi güncelledik! Bize <strong className="font-bold underline text-white decoration-white/50 hover:decoration-white transition-all select-all">team.kaffiy@gmail.com</strong> adresinden ulaşabilirsiniz.
                    </p>
                </div>

                <button
                    onClick={() => setIsVisible(false)}
                    className="shrink-0 p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
                    aria-label="Kapat"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
