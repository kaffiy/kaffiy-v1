# 🚀 Supabase CLI ile SQL Migration Rehberi

## Önkoşullar

1. **Supabase CLI Kurulumu:**
```bash
# Windows (PowerShell)
scoop install supabase

# veya npm ile
npm install -g supabase
```

2. **Supabase Login:**
```bash
supabase login
```

---

## 📋 SQL Dosyalarını Çalıştırma

### Yöntem 1: Supabase CLI ile Doğrudan Çalıştırma

```bash
# Project root'a git
cd c:\Users\gokce\OneDrive\Desktop\KAFFIY_PROJECT

# Supabase projesine bağlan
supabase link --project-ref ivuhmjtnnhieguiblnbr

# SQL dosyalarını çalıştır
supabase db execute -f supabase/rls_policies.sql
supabase db execute -f supabase/process_qr_scan_function.sql
supabase db execute -f supabase/create_admin_user.sql
```

### Yöntem 2: Migration Oluştur

```bash
# Yeni migration oluştur
supabase migration new setup_rls_policies
supabase migration new create_qr_scan_function
supabase migration new create_admin_user

# Migration dosyalarını düzenle (yukarıdaki SQL'leri kopyala)
# Sonra uygula:
supabase db push
```

### Yöntem 3: psql ile Doğrudan Bağlantı

```bash
# Supabase'den connection string al
# Dashboard > Settings > Database > Connection String

# psql ile bağlan
psql "postgresql://postgres:[PASSWORD]@db.ivuhmjtnnhieguiblnbr.supabase.co:5432/postgres"

# SQL dosyasını çalıştır
\i supabase/process_qr_scan_function.sql
```

---

## ⚡ Hızlı Kurulum (Tek Komut)

Tüm SQL dosyalarını sırayla çalıştırmak için:

```bash
# PowerShell
cd c:\Users\gokce\OneDrive\Desktop\KAFFIY_PROJECT

# Supabase'e bağlan
supabase link --project-ref ivuhmjtnnhieguiblnbr

# Tüm SQL'leri çalıştır
Get-ChildItem -Path .\supabase\*.sql | ForEach-Object {
    Write-Host "Running: $($_.Name)" -ForegroundColor Green
    supabase db execute -f $_.FullName
}
```

---

## 🔍 Doğrulama

SQL'lerin başarıyla çalıştığını kontrol et:

```bash
# RLS politikalarını kontrol et
supabase db execute -c "SELECT * FROM pg_policies WHERE tablename = 'campaign_tb';"

# QR scan fonksiyonunu kontrol et
supabase db execute -c "SELECT proname FROM pg_proc WHERE proname = 'process_qr_scan';"

# Admin kullanıcısını kontrol et
supabase db execute -c "SELECT * FROM worker_tb WHERE email = 'gokceoguz27@gmail.com';"
```

---

## 🛠️ Sorun Giderme

### "supabase: command not found"
```bash
# CLI'yi kur
npm install -g supabase

# veya
scoop install supabase
```

### "Project not linked"
```bash
# Projeye bağlan
supabase link --project-ref ivuhmjtnnhieguiblnbr
```

### "Permission denied"
```bash
# Supabase'e login ol
supabase login

# Access token al
# Dashboard > Settings > API > Service Role Key
```

---

## 📝 Notlar

1. **Güvenlik:** SQL dosyalarında şifre veya API key yok, sadece yapı tanımları var
2. **Sıralama:** SQL dosyaları sırayla çalıştırılmalı (önce RLS, sonra fonksiyonlar)
3. **Yedekleme:** Önemli değişiklikler öncesi database backup alın

---

## 🎯 Önerilen Yöntem

**En kolay ve güvenli:** Supabase Dashboard > SQL Editor kullanın
- Dosyaları kopyala-yapıştır
- Hataları anında görürsünüz
- Rollback kolay

**Otomasyon için:** Supabase CLI migrations kullanın
- Version control
- Team collaboration
- CI/CD pipeline

---

**Hazır!** Artık SQL dosyalarınızı terminal üzerinden çalıştırabilirsiniz! 🎉
