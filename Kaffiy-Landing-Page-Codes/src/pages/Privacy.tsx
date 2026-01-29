import { Layout } from "@/components/layout/Layout";
import { Shield, Lock, Eye, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function Privacy() {
  const { t } = useI18n();

  const highlights = [
    {
      icon: Shield,
      title: "Simple & Transparent",
      titleTr: "Basit ve Şeffaf",
      description: "We only collect what's needed to run the loyalty system.",
      descriptionTr: "Sadakat sistemini çalıştırmak için yalnızca gerekli olanı topluyoruz.",
    },
    {
      icon: Lock,
      title: "Your Data, Your Control",
      titleTr: "Veriniz, Kontrolünüz",
      description: "Customer data belongs to you, not us.",
      descriptionTr: "Müşteri verileri bize değil, size ait.",
    },
    {
      icon: Eye,
      title: "Minimal Collection",
      titleTr: "Minimal Veri Toplama",
      description: "Basic visit tracking, optional contact info for rewards.",
      descriptionTr: "Temel ziyaret takibi, ödüller için isteğe bağlı iletişim bilgisi.",
    },
    {
      icon: Trash2,
      title: "Right to Deletion",
      titleTr: "Silme Hakkı",
      description: "Customers can request data deletion at any time.",
      descriptionTr: "Müşteriler istedikleri zaman veri silme talep edebilir.",
    },
  ];

  const { language } = useI18n();

  return (
    <Layout>
      {/* Hero */}
      <section className="section-padding warm-gradient">
        <div className="section-container">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-heading font-semibold text-foreground mb-6">
              {t("privacy.title")}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t("privacy.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Key Points */}
      <section className="section-padding bg-background">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="p-6 bg-card rounded-2xl border border-border shadow-card"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-foreground mb-2">
                    {language === "tr" ? item.titleTr : item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === "tr" ? item.descriptionTr : item.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Full Policy */}
            <div className="bg-card rounded-2xl border border-border p-8 shadow-card">
              <h2 className="text-2xl font-heading font-semibold text-foreground mb-6">
                {language === "tr" ? "Tam Gizlilik Politikası" : "Full Privacy Policy"}
              </h2>
              
              <div className="prose prose-sm text-muted-foreground space-y-6">
                <div>
                  <h3 className="text-lg font-heading font-medium text-foreground mb-2">
                    {language === "tr" ? "1. Veri Sorumlusu" : "1. Data Controller"}
                  </h3>
                  <p>
                    {language === "tr" 
                      ? "Kaffiy, sadakat platformumuz aracılığıyla toplanan bilgilerin veri sorumlusudur."
                      : "Kaffiy is the data controller for information collected through our loyalty platform."}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-heading font-medium text-foreground mb-2">
                    {language === "tr" ? "2. Toplanan Veriler" : "2. What Data We Collect"}
                  </h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>{language === "tr" ? "Ziyaret zaman damgaları (müşteriler QR kodu taradığında)" : "Visit timestamps (when customers scan the QR code)"}</li>
                    <li>{language === "tr" ? "Telefon numarası veya e-posta (isteğe bağlı, ödül bildirimleri için)" : "Phone number or email (optional, for reward notifications)"}</li>
                    <li>{language === "tr" ? "Ödül kullanım geçmişi" : "Reward redemption history"}</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-heading font-medium text-foreground mb-2">
                    {language === "tr" ? "3. Veri Sahipliği" : "3. Data Ownership"}
                  </h3>
                  <p>
                    <strong className="text-foreground">
                      {language === "tr" 
                        ? "Müşteri verileri Kaffiy'e değil, kafeye aittir."
                        : "Customer data belongs to the café, not to Kaffiy."}
                    </strong>
                    {" "}
                    {language === "tr" 
                      ? "Biz araçları sağlıyoruz; ilişkiler size ait."
                      : "We provide the tools; you own the relationships."}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-heading font-medium text-foreground mb-2">
                    {language === "tr" ? "4. Veri Satışı Yok" : "4. No Data Selling"}
                  </h3>
                  <p>
                    {language === "tr" 
                      ? "Müşteri bilgilerini asla satmıyoruz, kiralamıyoruz veya üçüncü taraflarla paylaşmıyoruz."
                      : "We never sell, rent, or share customer information with third parties."}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-heading font-medium text-foreground mb-2">
                    {language === "tr" ? "5. Müşteri Hakları" : "5. Customer Rights"}
                  </h3>
                  <p>{language === "tr" ? "Müşterilerin hakları:" : "Customers have the right to:"}</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>{language === "tr" ? "Sadakat verilerine erişim" : "Access their loyalty data"}</li>
                    <li>{language === "tr" ? "Hatalı verilerin düzeltilmesini talep etme" : "Request correction of inaccurate data"}</li>
                    <li>{language === "tr" ? "Verilerinin silinmesini talep etme" : "Request deletion of their data"}</li>
                    <li>{language === "tr" ? "İletişimlerden çıkma" : "Opt out of communications"}</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-heading font-medium text-foreground mb-2">
                    {language === "tr" ? "6. İletişim" : "6. Contact"}
                  </h3>
                  <p>
                    {language === "tr" 
                      ? "Gizlilikle ilgili sorularınız için bize ulaşın: "
                      : "For any privacy-related questions, contact us at: "}
                    <a href="mailto:team.kaffiy@gmail.com" className="text-primary hover:underline">
                      team.kaffiy@gmail.com
                    </a>
                  </p>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    {language === "tr" ? "Son güncelleme: Ocak 2025" : "Last updated: January 2025"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
