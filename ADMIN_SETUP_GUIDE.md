# 🔐 Kaffiy Admin Hesabı Oluşturma Rehberi

## Kullanıcı Bilgileri
- **Email:** gokceoguz27@gmail.com
- **Şifre:** tumtavsan2020!
- **Rol:** Admin (Tam Sistem Erişimi)

---

## 📋 Adım Adım Kurulum

### 1️⃣ Supabase Dashboard'a Giriş Yapın

1. Tarayıcınızda şu adresi açın: https://supabase.com/dashboard
2. Kaffiy projenize giriş yapın (Project: `ivuhmjtnnhieguiblnbr`)

---

### 2️⃣ Kullanıcıyı Supabase Auth'a Ekleyin

1. Sol menüden **"Authentication"** sekmesine tıklayın
2. **"Users"** alt sekmesine gidin
3. Sağ üstteki **"Add User"** butonuna tıklayın
4. Açılan formda:
   - **Email:** `gokceoguz27@gmail.com`
   - **Password:** `tumtavsan2020!`
   - **Auto Confirm User:** ✅ **İŞARETLEYİN** (önemli!)
5. **"Create User"** butonuna tıklayın

---

### 3️⃣ Kullanıcı ID'sini Kopyalayın

1. Oluşturulan kullanıcıyı listede bulun
2. Kullanıcının **ID** sütunundaki UUID'yi kopyalayın
   - Örnek: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

---

### 4️⃣ Worker Tablosuna Admin Olarak Ekleyin

1. Sol menüden **"SQL Editor"** sekmesine tıklayın
2. **"New Query"** butonuna tıklayın
3. Aşağıdaki SQL kodunu yapıştırın:

```sql
-- ADIM 1: Kullanıcı ID'sini kontrol edin
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'gokceoguz27@gmail.com';

-- ADIM 2: Worker tablosuna admin olarak ekleyin
INSERT INTO worker_tb (
  id,
  email,
  name,
  role,
  company_id,
  created_at,
  updated_at
)
SELECT 
  id,
  'gokceoguz27@gmail.com',
  'Gökçe Oğuz',
  'admin',
  NULL,
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'gokceoguz27@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- ADIM 3: Doğrulama
SELECT 
  w.id,
  w.email,
  w.name,
  w.role,
  w.company_id,
  u.email_confirmed_at
FROM worker_tb w
LEFT JOIN auth.users u ON w.id = u.id
WHERE w.email = 'gokceoguz27@gmail.com';
```

4. **"Run"** butonuna tıklayın
5. Sonuçları kontrol edin:
   - ✅ `role` = `'admin'` olmalı
   - ✅ `company_id` = `NULL` olmalı
   - ✅ `email_confirmed_at` bir tarih olmalı

---

### 5️⃣ Giriş Yapın ve Test Edin

#### A. Kaffiy Admin Paneline Giriş
1. Tarayıcınızda açın: `http://localhost:5173` (Kaffiy-Admin dev server)
2. Giriş bilgileri:
   - **Email:** gokceoguz27@gmail.com
   - **Şifre:** tumtavsan2020!
3. **"Giriş Yap"** butonuna tıklayın
4. Başarılı olursa → Tüm kafeleri görebilirsiniz

#### B. Kaffiy Dashboard'a Giriş (Test)
1. Tarayıcınızda açın: `http://localhost:5173` (Kaffiy-Dashboard dev server)
2. Aynı bilgilerle giriş yapın
3. Admin olarak tüm kafelerin verilerini görebilirsiniz

---

## ✅ Doğrulama Kontrolleri

### Başarılı Kurulum Göstergeleri:

1. **Supabase Auth:**
   - ✅ Kullanıcı `auth.users` tablosunda görünüyor
   - ✅ `email_confirmed_at` dolu

2. **Worker Tablosu:**
   - ✅ `worker_tb` tablosunda kayıt var
   - ✅ `role` = `'admin'`
   - ✅ `company_id` = `NULL`

3. **Giriş Testi:**
   - ✅ Admin paneline giriş yapabiliyorsunuz
   - ✅ Tüm kafeleri görebiliyorsunuz
   - ✅ Yeni kafe oluşturabiliyorsunuz

---

## 🔧 Sorun Giderme

### Hata: "Invalid login credentials"
**Çözüm:**
- Supabase Dashboard > Authentication > Users
- Kullanıcının `email_confirmed_at` sütununu kontrol edin
- Boşsa, kullanıcıya tıklayıp "Confirm Email" seçeneğini kullanın

### Hata: "No company associated with this account"
**Çözüm:**
- SQL Editor'da şu sorguyu çalıştırın:
```sql
SELECT * FROM worker_tb WHERE email = 'gokceoguz27@gmail.com';
```
- Eğer kayıt yoksa, Adım 4'ü tekrarlayın
- Eğer `role` = `'admin'` değilse:
```sql
UPDATE worker_tb 
SET role = 'admin', company_id = NULL 
WHERE email = 'gokceoguz27@gmail.com';
```

### Hata: "Access denied"
**Çözüm:**
- RLS politikalarının uygulandığından emin olun:
```sql
-- Admin politikasını kontrol et
SELECT * FROM pg_policies 
WHERE tablename = 'company_tb' 
AND policyname LIKE '%admin%';
```
- Eğer politika yoksa, `supabase/rls_policies.sql` dosyasını çalıştırın

---

## 🎯 Admin Yetkileriniz

Admin hesabı ile yapabilecekleriniz:

### Kaffiy-Admin Paneli:
- ✅ Tüm kafeleri görüntüleme
- ✅ Yeni kafe oluşturma
- ✅ Kafe bilgilerini düzenleme
- ✅ Kafe sahiplerine manager hesabı oluşturma
- ✅ Sistem geneli analytics

### Kaffiy-Dashboard:
- ✅ Herhangi bir kafeye "giriş yapma" (test için)
- ✅ Tüm kafelerin kampanyalarını görme
- ✅ Tüm kafelerin müşterilerini görme

### Supabase Dashboard:
- ✅ Tüm tabloları görüntüleme
- ✅ SQL sorguları çalıştırma
- ✅ RLS politikalarını yönetme
- ✅ Kullanıcı yönetimi

---

## 📝 Notlar

1. **Güvenlik:**
   - Bu şifre sadece development için
   - Production'da daha güçlü bir şifre kullanın
   - 2FA (Two-Factor Authentication) aktif edin

2. **Yedek Admin:**
   - Başka bir admin hesabı da oluşturun
   - Acil durumlarda erişim için

3. **Loglama:**
   - Admin işlemleri loglanmalı
   - Audit trail için `admin_actions_tb` tablosu eklenebilir

---

## 🚀 Sonraki Adımlar

1. ✅ Admin hesabı oluşturuldu
2. ✅ Giriş yapıldı
3. ⏭️ İlk test kafesini oluşturun
4. ⏭️ Test kampanyası ekleyin
5. ⏭️ QR kod oluşturun
6. ⏭️ Mobile UI'da test edin

---

**Oluşturulma Tarihi:** 2026-02-07  
**Son Güncelleme:** 2026-02-07  
**Durum:** Hazır
