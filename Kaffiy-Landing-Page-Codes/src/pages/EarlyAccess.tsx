import { Layout } from "@/components/layout/Layout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { CheckCircle2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EarlyAccess() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    setIsSubmitted(true);
    toast({
      title: t("leadForm.success"),
      description: "🎉",
    });
  };

  return (
    <Layout>
      <section 
        className="section-padding relative overflow-hidden min-h-[80vh] flex items-center"
        style={{
          background: '#F8FAFC',
          transition: 'background 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Subtle theme-colored gradient */}
        <div 
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `radial-gradient(ellipse at 50% 50%, hsl(var(--primary) / 0.07) 0%, transparent 60%)`,
            filter: 'blur(100px)',
            transition: 'background 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
        
        <div className="section-container relative z-10 w-full">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 tracking-tight text-slate-900">
                {t("leadForm.title")}
              </h1>
            </div>

            {/* Form Card */}
            <div 
              className="rounded-3xl border p-8 animate-fade-in-up backdrop-blur-sm"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderColor: 'rgba(148, 163, 184, 0.5)',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.04)',
              }}
            >
              {/* Social Proof Badge - Top of Form */}
              <div 
                className="inline-flex items-center gap-2 px-5 py-2.5 text-white rounded-full mb-6 w-full justify-center shadow-lg"
                style={{
                  background: `linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary) / 0.8))`,
                }}
              >
                <Users className="w-5 h-5" />
                <span className="text-sm font-semibold">
                  {t("leadForm.socialProof")}
                </span>
              </div>
              
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: 'hsl(var(--primary))' }}
                  >
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl mb-2 text-slate-900">
                    {t("leadForm.success")}
                  </h3>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-medium text-slate-800">
                      {t("leadForm.name")}
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      className="h-12 rounded-2xl border-[#1E293B]/20 bg-background focus:ring-primary focus:border-primary"
                      placeholder="Ahmet Yılmaz"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cafeName" className="font-medium text-slate-800">
                      {t("leadForm.cafeName")}
                    </Label>
                    <Input
                      id="cafeName"
                      name="cafeName"
                      required
                      className="h-12 rounded-2xl border-[#1E293B]/20 bg-background focus:ring-primary focus:border-primary"
                      placeholder="Artisan Café"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="font-medium text-slate-800">
                      {t("leadForm.city")}
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      required
                      className="h-12 rounded-2xl border-[#1E293B]/20 bg-background focus:ring-primary focus:border-primary"
                      placeholder="İstanbul"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact" className="font-medium text-slate-800">
                      {t("leadForm.contact")}
                    </Label>
                    <Input
                      id="contact"
                      name="contact"
                      required
                      className="h-12 rounded-2xl border-[#1E293B]/20 bg-background focus:ring-primary focus:border-primary"
                      placeholder="0532 xxx xx xx"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg"
                    disabled={isLoading}
                    className="w-full h-14 bg-primary text-primary-foreground hover:opacity-90 rounded-2xl text-base font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    {isLoading ? "..." : t("leadForm.submit")}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
