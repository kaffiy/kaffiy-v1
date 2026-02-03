import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "tr";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Logo
    "logo.subtitle": "AI Business Partner",

    // Navbar
    "nav.home": "Home",
    "nav.howItWorks": "How it works",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.startPilot": "Get Started",

    // Hero
    "hero.headline": "Paper Cards Out, AI at the Register!",
    "hero.highlight": "AI",
    "hero.subheadline": "Predict customer behavior and win back regulars automatically with Kaffiy.",
    "hero.cta.primary": "Win Back Lost Regulars",
    "hero.cta.setup": "Setup takes only 5 minutes",
    "hero.cta.secondary": "Request a Free Demo",

    // Why Kaffiy (Problem & Solution)
    "whyKaffiy.title": "The Formula for Growth in Tough Times",
    "whyKaffiy.card1.title": "Win Back Lost Customers",
    "whyKaffiy.card1.desc": "AI detects customers drifting away and automatically brings them back with the right offer.",
    "whyKaffiy.card2.title": "Smart Personalized Campaigns",
    "whyKaffiy.card2.desc": "Don't spam everyone. Segment your customers and send targeted offers that motivate frequent visits.",
    "whyKaffiy.card3.title": "Boost Revenue & Resilience",
    "whyKaffiy.card3.desc": "Your loyal customers are your safety net. Revitalize dropping foot traffic and secure your cash flow.",

    // How it works
    "howItWorks.title": "How it works",
    "howItWorks.step1.title": "Place Your QR Code",
    "howItWorks.step1.desc": "Create your QR and place it at the counter.",
    "howItWorks.step2.title": "App-Free Scanning",
    "howItWorks.step2.desc": "Customers scan with their camera, no app.",
    "howItWorks.step3.title": "Instant Loyalty",
    "howItWorks.step3.desc": "Points sync instantly, you recognize regulars.",

    // Dashboard Preview
    "dashboard.title": "Grow with Data, Not Guesses.",
    "dashboard.metric1": "Returning customers",
    "dashboard.metric2": "Busiest hours",
    "dashboard.desc": "See loyal customers, peak hours, and churn risk at a glance.",

    // App Showcase
    "appShowcase.title": "Speed and Elegance Your Customers Will Love",
    "appShowcase.desc": "A smooth experience that opens in seconds, without the hassle of app downloads. Whether your customer chooses night or day mode, your interface always looks modern.",
    "appShowcase.lightMode": "Light Mode",
    "appShowcase.darkMode": "Dark Mode",
    "appShowcase.home": "Home",
    "appShowcase.loyalty": "Loyalty Card",
    "appShowcase.qr": "QR Code",

    // Lead Form
    "leadForm.title": "Be Among the First to Use Kaffiy, Gain Lifetime Benefits.",
    "leadForm.name": "Full Name",
    "leadForm.cafeName": "Café Name",
    "leadForm.city": "City",
    "leadForm.email": "E-mail",
    "leadForm.emailPlaceholder": "cafe@example.com",
    "leadForm.contact": "Mobile Phone (WhatsApp)",
    "leadForm.submit": "Join Early Access",
    "leadForm.socialProof": "50+ cafés have already reserved their spot! 🔥",
    "leadForm.success": "Thank you! We'll be in touch soon.",
    "leadForm.errorTitle": "Something went wrong",
    "leadForm.errorDesc": "Please try again in a moment.",

    // About
    "about.title": "Built by Kaffiy",
    "about.p1": "Kaffiy is an automation-focused company building simple, human-centered systems for offline businesses.",
    "about.p2": "We believe technology should remove friction, not add complexity.",
    "about.p3": "This loyalty platform is part of our long-term vision to help cafés and local businesses build stronger relationships with their customers — without forcing them into rigid or expensive systems.",
    "about.learnMore": "Learn more about us",

    // CTA
    "cta.title": "Start simple.",
    "cta.button": "Run a pilot in your café",
    "cta.subtext": "No long-term contracts. Start small and see how it feels.",

    // Partners
    "partners.title": "Brands Working With Us",
    "partners.subtitle": "Join leading cafés using Kaffiy to build customer loyalty",

    // Footer
    "footer.missionTitle": "We Believe in the Power of Local Businesses.",
    "footer.missionText": "We bring chain brand technology to boutique cafés. We create solutions that simplify your work, not complex systems.",
    "footer.missionLink": "Read Our Story ->",
    "footer.tagline": "Designed for café owners, loved by regulars.",
    "footer.description": "QR code-based smart loyalty system for cafés. Everything works in the cloud.",
    "footer.builtBy": "Built by Kaffiy",
    "footer.privacy": "Privacy Policy",
    "footer.contact": "Contact",
    "footer.rights": "All rights reserved.",
    "footer.links": "Links",
    "footer.quickLinks": "Quick Links",
    "footer.legal": "Legal & Support",
    "footer.social": "Follow Us",
    "footer.email": "Email",
    "footer.with": "with",
    "footer.copyright": "© 2026 Kaffiy Inc. Coded in Istanbul with ☕.",

    // Contact page
    "contact.title": "Let's Talk About Your Café's Future.",
    "contact.subtitle": "Have questions about the system? Don't deal with email traffic, reach out to us directly. We're here to help.",
    "contact.cardTitle": "Get in touch",
    "contact.cardDesc": "Send us an email and we'll get back to you within 24 hours.",
    "contact.button": "Write on WhatsApp",
    "contact.emailAlt": "or send an email to team.kaffiy@gmail.com",
    "contact.note": "No sales pressure. Just a friendly conversation about your café. ☕",

    // Privacy page
    "privacy.title": "Privacy Policy",
    "privacy.subtitle": "Your privacy matters. Here's how we handle data.",

    // About page
    "about.hero.title": "Coffee Passion Meets Technology.",
    "about.hero.p1": "Kaffiy is a QR code-based smart loyalty system for cafés. It works in the cloud, requires no app download. Customers scan QR codes at checkout to collect points, and you manage your business with real-time data analytics.",
    "about.hero.p2": "No POS integration or expensive hardware required. 5-minute setup, independent, fast and hassle-free system. We bring chain brand technology to boutique cafés.",
    "about.values.title": "Our Values",
    "about.value1.title": "Merchant-Friendly Technology",
    "about.value1.desc": "Technology should serve people, not the other way around. We think about the end user in every decision.",
    "about.value2.title": "Passion for Speed",
    "about.value2.desc": "Complexity is our enemy. The simplest solution is usually the best solution.",
    "about.value3.title": "Result-Oriented",
    "about.value3.desc": "We don't try to do everything. We prefer to do one thing really well.",
    "about.value4.title": "Growing Together",
    "about.value4.desc": "We're looking for lasting partnerships, not quick sales.",
    "about.vision.title": "Our Vision",
    "about.vision.p1": "We aim to create the simplest and most effective loyalty system for cafés. We believe technology doesn't have to be complicated.",
    "about.vision.p2": "Our goal: Help café owners build stronger connections with their customers and make data-driven decisions.",
  },
  tr: {
    // Logo
    "logo.subtitle": "Yapay Zeka İşletme Ortağı",

    // Navbar
    "nav.home": "Ana Sayfa",
    "nav.howItWorks": "Nasıl Çalışır",
    "nav.about": "Hakkımızda",
    "nav.contact": "İletişim",
    "nav.startPilot": "Hemen Başla",

    // Hero
    "hero.headline": "Kağıt Kartlar Çöpe, Yapay Zeka Kasaya!",
    "hero.highlight": "Yapay Zeka",
    "hero.subheadline": "Müşteri davranışını tahmin edin, müdavimleri otomatik geri kazanın.",
    "hero.cta.primary": "Kayıp Müşterilerinizi Geri Kazanın",
    "hero.cta.setup": "Kurulum sadece 5 dakika",
    "hero.cta.secondary": "Ücretsiz Demo İsteyin",

    // Why Kaffiy (Problem & Solution)
    "whyKaffiy.title": "İşletmenizi Büyüten 3 Kritik Hamle",
    "whyKaffiy.card1.title": "Kayıp Müşterileri Geri Kazanın",
    "whyKaffiy.card1.desc": "Gelmesi kesilen müşteriyi yapay zeka tespit eder, otomatik teklif göndererek dükkanınıza geri döndürür.",
    "whyKaffiy.card2.title": "Kişiye Özel Kampanya & Motivasyon",
    "whyKaffiy.card2.desc": "Herkese aynı mesajı atmayın. Müşterilerinize özel, onları daha sık gelmeye motive edecek nokta atışı kampanyalar sunun.",
    "whyKaffiy.card3.title": "Cironuzu & Nakit Akışınızı Artırın",
    "whyKaffiy.card3.desc": "Ekonomik belirsizlikte en büyük gücünüz sadık müşterilerinizdir. Azalan müşteri trafiğini canlandırarak gelirinizi tekrar yükseltin.",

    // How it works
    "howItWorks.title": "Nasıl çalışır?",
    "howItWorks.step1.title": "QR Kodunuzu Koyun",
    "howItWorks.step1.desc": "QR kodu oluşturun ve kasaya yerleştirin.",
    "howItWorks.step2.title": "Uygulamasız Tarama",
    "howItWorks.step2.desc": "Uygulama yok, kamera ile tarama.",
    "howItWorks.step3.title": "Anında Sadakat",
    "howItWorks.step3.desc": "Puanlar anında işler, müdavim görünür.",

    // Dashboard Preview
    "dashboard.title": "Tahminlerle Değil, Verilerle Büyüyün.",
    "dashboard.metric1": "Geri dönen müşteri oranı",
    "dashboard.metric2": "En yoğun saatler",
    "dashboard.desc": "Sadık müşteriler, yoğun saatler ve riskler tek ekranda.",

    // App Showcase
    "appShowcase.title": "Müşterilerinizin Seveceği Hız ve Şıklık",
    "appShowcase.desc": "Uygulama indirme derdi olmadan, saniyeler içinde açılan pürüzsüz bir deneyim. Müşteriniz ister gece ister gündüz modunu seçsin, arayüzünüz her zaman modern görünür.",
    "appShowcase.lightMode": "Aydınlık Mod",
    "appShowcase.darkMode": "Karanlık Mod",
    "appShowcase.home": "Ana Sayfa",
    "appShowcase.loyalty": "Sadakat Kartı",
    "appShowcase.qr": "QR Kod",

    // Lead Form
    "leadForm.title": "Kaffiy'i İlk Kullananlardan Olun, Ömür Boyu Avantaj Kazanın.",
    "leadForm.name": "Ad Soyad",
    "leadForm.cafeName": "Kafe Adı",
    "leadForm.city": "Şehir",
    "leadForm.email": "E-posta",
    "leadForm.emailPlaceholder": "ornek@kafe.com",
    "leadForm.contact": "Cep Telefonu (WhatsApp)",
    "leadForm.submit": "Erken Erişime Katıl",
    "leadForm.socialProof": "Şimdiden 50+ kafe yerini ayırttı! 🔥",
    "leadForm.success": "Teşekkürler! En kısa sürede iletişime geçeceğiz.",
    "leadForm.errorTitle": "Bir hata oluştu",
    "leadForm.errorDesc": "Lütfen biraz sonra tekrar deneyin.",

    // About
    "about.title": "Kaffiy tarafından geliştirildi",
    "about.p1": "Kaffiy, çevrimdışı işletmeler için basit, insan odaklı sistemler geliştiren otomasyon odaklı bir şirkettir.",
    "about.p2": "Teknolojinin karmaşıklık eklemek yerine sürtünmeyi azaltması gerektiğine inanıyoruz.",
    "about.p3": "Bu sadakat platformu, kafelerin ve yerel işletmelerin müşterileriyle daha güçlü ilişkiler kurmasına yardımcı olma vizyonumuzun bir parçasıdır — onları katı veya pahalı sistemlere zorlamadan.",
    "about.learnMore": "Hakkımızda daha fazla bilgi",

    // CTA
    "cta.title": "Basit başla.",
    "cta.button": "Kafenizde pilot çalıştırın",
    "cta.subtext": "Uzun vadeli sözleşme yok. Küçük başlayın ve nasıl hissettiğini görün.",

    // Partners
    "partners.title": "Bizimle Çalışan Markalar",
    "partners.subtitle": "Müşteri sadakati oluşturmak için Kaffiy kullanan önde gelen kafelere katılın",

    // Footer
    "footer.missionTitle": "Yerel İşletmelerin Gücüne İnanıyoruz.",
    "footer.missionText": "Zincir markaların teknolojisini, butik kafelere taşıyoruz. Karmaşık sistemler değil, işinizi kolaylaştıran çözümler üretiyoruz.",
    "footer.missionLink": "Hikayemizi Okuyun ->",
    "footer.tagline": "Kafe sahipleri için tasarlandı, müdavimler tarafından sevildi.",
    "footer.description": "QR kod tabanlı akıllı sadakat sistemi. Her şey bulut sistemi üzerinden çalışır.",
    "footer.builtBy": "Kaffiy tarafından geliştirildi",
    "footer.privacy": "Gizlilik Politikası",
    "footer.contact": "İletişim",
    "footer.rights": "Tüm hakları saklıdır.",
    "footer.links": "Linkler",
    "footer.quickLinks": "Hızlı Linkler",
    "footer.legal": "Yasal & Destek",
    "footer.social": "Bizi Takip Edin",
    "footer.email": "E-posta",
    "footer.with": "ile",
    "footer.copyright": "© 2026 Kaffiy Inc. İstanbul'da ☕ ile kodlandı.",

    // Contact page
    "contact.title": "Kafenizin Geleceğini Konuşalım.",
    "contact.subtitle": "Sistem hakkında sorularınız mı var? Mail trafiğiyle uğraşmayın, bize doğrudan ulaşın. Yardımcı olmak için buradayız.",
    "contact.cardTitle": "Bize ulaşın",
    "contact.cardDesc": "Bize e-posta gönderin, 24 saat içinde size dönelim.",
    "contact.button": "WhatsApp'tan Yazın",
    "contact.emailAlt": "veya team.kaffiy@gmail.com adresine mail atın",
    "contact.note": "Satış baskısı yok. Sadece kafeniz hakkında samimi bir sohbet. ☕",

    // Privacy page
    "privacy.title": "Gizlilik Politikası",
    "privacy.subtitle": "Gizliliğiniz önemli. Verileri nasıl işlediğimizi anlattık.",

    // About page
    "about.hero.title": "Kahve Tutkusu, Teknolojiyle Buluştu.",
    "about.hero.p1": "Kaffiy, kafeler için QR kod tabanlı akıllı sadakat sistemidir. Bulut sistemi üzerinden çalışır, uygulama indirme gerektirmez. Müşteriler kasada QR kodu taratarak puan toplar, siz de gerçek zamanlı veri analizi ile işletmenizi yönetirsiniz.",
    "about.hero.p2": "POS entegrasyonu veya pahalı donanım gerektirmez. 5 dakikada kurulum, bağımsız çalışan, hızlı ve sorunsuz bir sistem. Zincir markaların teknolojisini, butik kafelere taşıyoruz.",
    "about.values.title": "Değerlerimiz",
    "about.value1.title": "İşletme Dostu Teknoloji",
    "about.value1.desc": "Teknoloji insanlara hizmet etmeli, tersi değil. Her kararımızda son kullanıcıyı düşünüyoruz.",
    "about.value2.title": "Hız Tutkusu",
    "about.value2.desc": "Karmaşıklık düşmanımız. En basit çözüm genellikle en iyi çözümdür.",
    "about.value3.title": "Sonuç Odaklılık",
    "about.value3.desc": "Her şeyi yapmaya çalışmıyoruz. Bir şeyi çok iyi yapmayı tercih ediyoruz.",
    "about.value4.title": "Birlikte Büyüme",
    "about.value4.desc": "Hızlı satış değil, kalıcı ortaklıklar arıyoruz.",
    "about.vision.title": "Vizyonumuz",
    "about.vision.p1": "Kafeler için en basit ve etkili sadakat sistemini oluşturmayı hedefliyoruz. Teknolojinin karmaşık olması gerekmediğine inanıyoruz.",
    "about.vision.p2": "Amacımız: Kafe sahiplerinin müşterileriyle daha güçlü bağlar kurmasına ve veri odaklı kararlar almasına yardımcı olmak.",
  },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("tr");

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}