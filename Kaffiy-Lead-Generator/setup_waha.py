import requests
import time
import os

# Terminalde gördüğün en son güncel key
API_KEY = "72c66d88d5ff48e9b9236e5503ef9dbd"
BASE_URL = "http://localhost:3000/api"
HEADERS = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json"
}

def setup_and_get_qr():
    print("🚀 WAHA Kurulumu ve QR Alımı Başlıyor...")

    try:
        # 1. Önce varsa eski session'ı temizle (Tertemiz bir başlangıç için)
        print("🧹 Eski oturum temizleniyor...")
        requests.delete(f"{BASE_URL}/sessions/default", headers=HEADERS)
        time.sleep(2)

        # 2. Yeni 'default' session'ı başlat
        print("🎬 'default' oturumu başlatılıyor...")
        start_payload = {"name": "default"}
        start_res = requests.post(f"{BASE_URL}/sessions/start", json=start_payload, headers=HEADERS)
        
        if start_res.status_code not in [200, 201, 422]:
            print(f"❌ Oturum başlatılamadı: {start_res.text}")
            return

        print("⏳ QR kodun hazırlanması için 10 saniye bekleniyor (Chromium açılıyor)...")
        time.sleep(10)

        # 3. QR Kodu Görüntü (Image) olarak indir
        print("📸 QR kod indiriliyor...")
        # NOT: Bazı versiyonlarda /auth/qr direkt image döner, bazılarında /screenshot kullanılır.
        # En garantisi screenshot üzerinden QR almaktır.
        qr_res = requests.get(f"{BASE_URL}/default/auth/qr", headers=HEADERS)

        if qr_res.status_code == 200:
            with open("whatsapp_qr.png", "wb") as f:
                f.write(qr_res.content)
            print("\n" + "="*50)
            print("✅ BAŞARILI!")
            print(f"👉 Klasöründeki 'whatsapp_qr.png' dosyasını aç ve telefonuna tarat.")
            print("="*50)
        else:
            print(f"❌ QR alınamadı (Henüz hazır olmayabilir): {qr_res.status_code}")
            print("İpucu: Docker terminaline bak, 'Waiting for QR' yazıyorsa 5 saniye sonra tekrar çalıştır.")

    except Exception as e:
        print(f"💥 Bir hata oluştu: {e}")

if __name__ == "__main__":
    setup_and_get_qr()