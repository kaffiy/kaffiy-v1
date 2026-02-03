# Anti-Ban Utility Functions for Kaffiy Bot
import random
from datetime import datetime
import time
import logging

# Set up local logger
logger = logging.getLogger("kaffiy_bot.anti_ban")

# Global error counter for safety pause
_ERROR_COUNTER = {"count": 0, "last_reset": time.time(), "paused_until": 0}

def paraphrase_message(original_message, client):
    """
    1. DİNAMİK MESAJ VARYASYONU (AI Paraphrasing)
    Aynı mesajı üst üste iki kişiye atma. Her mesajı AI ile hafifçe değiştir.
    """
    if not client:
        return original_message
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Sen bir mesaj varyasyon uzmanısın. Verilen mesajın anlamını bozmadan kelimelerini ve girişini hafifçe değiştir. CASUAL YAZ noktalama az olsun."},
                {"role": "user", "content": f"Bu mesajı anlamını bozmadan hafifçe değiştir (Selam yerine Merhabalar üstat gibi):\n\n{original_message}"}
            ],
            temperature=0.8,
            max_tokens=200
        )
        varied_message = response.choices[0].message.content.strip()
        logger.info(f"📝 Mesaj varyasyonu oluşturuldu")
        return varied_message
    except Exception as e:
        logger.warning(f"Paraphrase hatası: {e}, orijinal mesaj kullanılıyor")
        return original_message

def add_natural_jitter():
    """
    2. RASTGELE "DÜŞÜNME" SÜRESİ (Natural Jitter)
    Her mesajdan önce 5-15 saniye arası tamamen rastgele ek bekleme.
    """
    jitter = random.randint(5, 15)
    logger.info(f"⏳ Natural jitter: {jitter} saniye bekleniyor...")
    time.sleep(jitter)

def is_business_hours():
    """
    4. AKILLI MESAİ SAATLERİ
    Esnafın en az yoğun olduğu saatler:
    - Sabah: 10:00 - 12:00
    - Öğleden sonra: 15:00 - 20:00
    """
    now = datetime.now()
    hour = now.hour
    minute = now.minute
    
    # Check Morning Slot: 10:00 - 12:00
    is_morning = (hour >= 10 and hour < 12)
    
    # Check Afternoon Slot: 15:00 - 20:00
    is_afternoon = (hour >= 15 and hour < 20)
    
    # Check Weekday (Sunday closed)
    is_weekday = (now.weekday() != 6) # 6 is Sunday
    
    return is_weekday and (is_morning or is_afternoon)

def check_and_handle_errors(success):
    """
    5. OTOMATİK DURAKLATMA (Safety Pause)
    Üst üste 3 mesaj gönderim hatası alırsa 30 dakika standby.
    """
    global _ERROR_COUNTER
    
    # Check if we're currently paused
    if time.time() < _ERROR_COUNTER["paused_until"]:
        remaining = int(_ERROR_COUNTER["paused_until"] - time.time())
        logger.warning(f"⏸️  STANDBY MODE: {remaining} saniye kaldı")
        return False  # Still paused
    
    # Reset counter every hour
    if time.time() - _ERROR_COUNTER["last_reset"] > 3600:
        _ERROR_COUNTER["count"] = 0
        _ERROR_COUNTER["last_reset"] = time.time()
    
    if success:
        # Reset on success
        _ERROR_COUNTER["count"] = 0
    else:
        # Increment on failure
        _ERROR_COUNTER["count"] += 1
        logger.warning(f"❌ Hata sayacı: {_ERROR_COUNTER['count']}/3")
        
        if _ERROR_COUNTER["count"] >= 3:
            # Pause for 30 minutes
            _ERROR_COUNTER["paused_until"] = time.time() + (30 * 60)
            logger.error("🚨 SAFETY PAUSE: 3 hata tespit edildi! 30 dakika STANDBY moduna geçiliyor.")
            return False
    
    return True  # OK to continue
