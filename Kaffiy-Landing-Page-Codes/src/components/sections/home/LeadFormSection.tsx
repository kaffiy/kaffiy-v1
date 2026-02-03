import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { CheckCircle2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function LeadFormSection() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const endpoint = import.meta.env.VITE_LEAD_ENDPOINT || "/api/lead";

    try {
      const formData = new FormData(e.currentTarget);
      const payload = {
        name: String(formData.get("name") || "").trim(),
        cafeName: String(formData.get("cafeName") || "").trim(),
        city: String(formData.get("city") || "").trim(),
        email: String(formData.get("email") || "").trim(),
        contact: String(formData.get("contact") || "").trim(),
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Lead request failed");
      }

      setIsSubmitted(true);
      toast({
        title: t("leadForm.success"),
        description: "🎉",
      });
    } catch (error) {
      console.error("Lead form submit failed:", error);
      toast({
        title: t("leadForm.errorTitle"),
        description: t("leadForm.errorDesc"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      id="lead-form"
      className="section-padding relative overflow-hidden"
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)',
        }}
      />

      <div className="section-container relative z-10">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold mb-4 tracking-tight text-slate-900 leading-tight"
            >
              {t("leadForm.title")}
            </h2>
            <p className="text-slate-500 max-w-md mx-auto">
              {t("leadForm.socialProof")}
            </p>
          </div>

          {/* Form Card */}
          <div
            className="rounded-3xl border border-white/40 p-6 sm:p-10 shadow-2xl backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 relative overflow-hidden"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Soft tint gradient inside card */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />

            {isSubmitted ? (
              <div className="text-center py-12 relative z-10">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 animate-fade-in-up"
                >
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-heading font-bold text-2xl text-slate-900 dark:text-white mb-3">
                  {t("leadForm.success")}
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  En kısa sürede sizinle iletişime geçeceğiz.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-semibold text-sm ml-1">
                    {t("leadForm.name")}
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    className="h-14 rounded-2xl border-transparent bg-white/70 dark:bg-slate-800/50 shadow-sm focus:bg-white dark:focus:bg-slate-800 transition-all border outline-none ring-0 focus:ring-2 focus:ring-primary/20 px-5 text-base"
                    placeholder="Adınız Soyadınız"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="cafeName" className="text-slate-700 dark:text-slate-300 font-semibold text-sm ml-1">
                      {t("leadForm.cafeName")}
                    </Label>
                    <Input
                      id="cafeName"
                      name="cafeName"
                      required
                      className="h-14 rounded-2xl border-transparent bg-white/70 dark:bg-slate-800/50 shadow-sm focus:bg-white dark:focus:bg-slate-800 transition-all border outline-none ring-0 focus:ring-2 focus:ring-primary/20 px-5 text-base"
                      placeholder="Örn: Kaffiy Coffee"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-slate-700 dark:text-slate-300 font-semibold text-sm ml-1">
                      {t("leadForm.city")}
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      required
                      className="h-14 rounded-2xl border-transparent bg-white/70 dark:bg-slate-800/50 shadow-sm focus:bg-white dark:focus:bg-slate-800 transition-all border outline-none ring-0 focus:ring-2 focus:ring-primary/20 px-5 text-base"
                      placeholder="Örn: İstanbul"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-semibold text-sm ml-1">
                    {t("leadForm.email")}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="h-14 rounded-2xl border-transparent bg-white/70 dark:bg-slate-800/50 shadow-sm focus:bg-white dark:focus:bg-slate-800 transition-all border outline-none ring-0 focus:ring-2 focus:ring-primary/20 px-5 text-base"
                    placeholder={t("leadForm.emailPlaceholder")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact" className="text-slate-700 dark:text-slate-300 font-semibold text-sm ml-1">
                    {t("leadForm.contact")}
                  </Label>
                  <Input
                    id="contact"
                    name="contact"
                    required
                    className="h-14 rounded-2xl border-transparent bg-white/70 dark:bg-slate-800/50 shadow-sm focus:bg-white dark:focus:bg-slate-800 transition-all border outline-none ring-0 focus:ring-2 focus:ring-primary/20 px-5 text-base"
                    placeholder="05XX XXX XX XX"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white rounded-2xl text-lg font-bold shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 mt-4"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Gönderiliyor...
                    </span>
                  ) : t("leadForm.submit")}
                </Button>

                <p className="text-xs text-center text-slate-400 mt-4">
                  * Bilgileriniz Kaffiy güvencesinde saklanır ve asla 3. taraflarla paylaşılmaz.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}