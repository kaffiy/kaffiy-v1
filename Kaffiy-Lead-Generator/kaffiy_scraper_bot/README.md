# Kaffiy Scraper Bot

Google Custom Search API ile lead arama, temizleme ve dashboard entegrasyonu.

## Kurulum

```bash
cd kaffiy_scraper_bot
pip install -r requirements.txt
```

## Ortam Değişkenleri

`.env` dosyası oluşturun (veya `.env.example`'dan kopyalayın):

- `GOOGLE_API_KEY`: Google Cloud API Key (Custom Search API etkin)
- `GOOGLE_CSE_ID`: Programmable Search Engine ID

[CSE oluşturma](https://programmablesearchengine.google.com/) → "Search the entire web" veya belirli siteler. Günlük ücretsiz kotada 100 arama.

## Kullanım

### Komut satırı

```bash
# Proje kökünden (Kaffiy-Lead-Generator)
python -m kaffiy_scraper_bot --query "kafe kadıköy" --city "İstanbul" --max 20
```

### Dashboard

Growth Hub dashboard'da **Scraper (Google Lead Arama)** bölümünü açın:

1. Arama sorgusu girin (örn: `kafe kadıköy`, `kahveci istanbul`)
2. Şehir ve max sonuç ayarlayın
3. **Arama Başlat** ile Google araması çalışır; sonuçlar temizlenir ve **Scraped Leads** tablosuna yazılır
4. **Ekle** ile seçili satırı `leads_data.json`'a ekleyin (mevcut bot ile mesaj göndermeye hazır)
5. **Reddet** ile listeden çıkarın

## Akış

1. **Arama**: Google Custom Search API ile sorgu çalıştırılır
2. **Temizleme**: Blacklist (kıraathane, market, zincir vb.) ve iletişim kontrolü
3. **Çıktı**: `kaffiy-growth-dashboard/.../src/data/scraped_leads.json` ve `scraper_status.json`
4. **Lead'lere ekleme**: Dashboard'dan "Ekle" ile `leads_data.json`'a eklenir; mevcut WhatsApp bot ile mesaj gönderilebilir

## End-to-end

Scraper → (temizleme) → Scraped Leads tablosu → "Lead'lere Ekle" → Leads tablosu → Mevcut bot ile mesaj gönderimi
