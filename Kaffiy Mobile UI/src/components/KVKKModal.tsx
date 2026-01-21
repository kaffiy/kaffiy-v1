import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface KVKKModalProps {
  open: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

const KVKKModal = ({ open, onClose, onAccept }: KVKKModalProps) => {
  const handleAccept = () => {
    if (onAccept) {
      onAccept();
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md max-h-[80vh] bg-background border-border rounded-2xl p-0 flex flex-col shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
          <DialogTitle className="text-base font-bold text-foreground">
            KVKK Aydınlatma Metni
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">
              KAFFİY SADAKAT PROGRAMI AYDINLATMA METNİ
            </h3>

            <section>
              <h4 className="text-sm font-semibold text-foreground mb-1.5">1. Veri Sorumlusu</h4>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Kaffiy ("Platform"), 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, 
                kişisel verilerinizin güvenliğini sağlamak ve hukuka uygun işlenmesini temin etmek amacıyla 
                veri sorumlusu sıfatıyla hareket etmektedir.
              </p>
            </section>

            <section>
              <h4 className="text-sm font-semibold text-foreground mb-1.5">2. İşlenen Kişisel Verileriniz ve İşleme Amaçları</h4>
              <p className="text-xs leading-relaxed text-muted-foreground mb-2">
                Platform üzerinden sunulan sadakat programı hizmetlerinden faydalanabilmeniz amacıyla 
                aşağıdaki verileriniz işlenmektedir:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                <li>
                  <strong className="text-foreground">Kimlik Bilgileri:</strong> Adınız ve soyadınız 
                  (Sadakat kartınızın size tanımlanması ve ödül hak edişlerinizin doğrulanması amacıyla).
                </li>
                <li>
                  <strong className="text-foreground">İletişim Bilgileri:</strong> E-posta adresiniz 
                  (Sistem bildirimleri, şifre yenileme ve açık rızanız olması halinde kampanya duyuruları için).
                </li>
                <li>
                  <strong className="text-foreground">İşlem Bilgileri:</strong> Ziyaret ettiğiniz kafeler, 
                  ziyaret sıklığınız, topladığınız dijital puanlar ve kazandığınız ödüller
                  (Hizmetin temel fonksiyonu olan sadakat programının yürütülmesi amacıyla).
                </li>
                <li>
                  <strong className="text-foreground">Diğer:</strong> Doğum tarihiniz 
                  (Opsiyonel olarak; doğum gününüze özel sürpriz ödüller sunulabilmesi amacıyla).
                </li>
              </ul>
            </section>

            <section>
              <h4 className="text-sm font-semibold text-foreground mb-1.5">3. Kişisel Verilerinizin Aktarılması</h4>
              <p className="text-xs leading-relaxed text-muted-foreground mb-2">Kişisel verileriniz;</p>
              <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4">
                <li>
                  <strong className="text-foreground">İşletme Sahipleri (Kafeler):</strong> Ziyaret ettiğiniz 
                  kafe sahiplerine, sadece ödül hak edişlerinizin takibi ve kampanya yönetimi amacıyla 
                  (genellikle anonimleştirilmiş veya maskelenmiş şekilde) aktarılır.
                </li>
                <li>
                  <strong className="text-foreground">Yasal Yükümlülükler:</strong> Yetkili kamu kurum ve 
                  kuruluşlarına, hukuki uyuşmazlıkların giderilmesi veya yasal mevzuat gereği talep edilmesi 
                  durumunda aktarılabilecektir.
                </li>
              </ul>
            </section>

            <section>
              <h4 className="text-sm font-semibold text-foreground mb-1.5">4. Veri Toplama Yöntemi ve Hukuki Sebebi</h4>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Verileriniz, QR kod taratılması ve dijital arayüz formlarının doldurulması suretiyle tamamen 
                otomatik yollarla toplanmaktadır. İşleme faaliyetleri; "Bir sözleşmenin kurulması veya ifasıyla 
                doğrudan doğruya ilgili olması" ve "Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi" 
                hukuki sebeplerine dayanmaktadır.
              </p>
            </section>

            <section>
              <h4 className="text-sm font-semibold text-foreground mb-1.5">5. Veri Sahibi Olarak Haklarınız</h4>
              <p className="text-xs leading-relaxed text-muted-foreground">
                KVKK'nın 11. maddesi uyarınca dilediğiniz zaman Platform'a başvurarak; verilerinizin işlenip 
                işlenmediğini öğrenme, işlenmişse bilgi talep etme, verilerin düzeltilmesini veya silinmesini 
                isteme haklarına sahipsiniz.
              </p>
            </section>
          </div>
        </div>

        {/* Footer Button */}
        <div className="px-5 py-4 border-t border-border bg-background shrink-0">
          <Button
            variant="cafe"
            className="w-full"
            onClick={handleAccept}
          >
            Okudum, Anladım
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KVKKModal;
