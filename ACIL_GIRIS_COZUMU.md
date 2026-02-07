# 🚨 ACİL: Admin Paneline Giriş Sorunu Çözümü

## ❌ Sorun
"Invalid login credentials" hatası alıyorsunuz.

## ✅ Çözüm (5 Dakika)

### 1️⃣ Supabase Dashboard'a Git
👉 https://supabase.com/dashboard/project/ivuhmjtnnhieguiblnbr

### 2️⃣ Kullanıcı Oluştur
1. Sol menüden **"Authentication"** tıkla
2. **"Users"** sekmesine git
3. **"Add User"** butonuna tıkla
4. Formu doldur:
   ```
   Email: gokceoguz27@gmail.com
   Password: 123
   ✅ Auto Confirm User (MUTLAKA İŞARETLE!)
   ```
5. **"Create User"** tıkla

### 3️⃣ Admin Rolü Ver
1. Sol menüden **"SQL Editor"** tıkla
2. **"New Query"** tıkla
3. Aşağıdaki kodu yapıştır:

```sql
-- Admin kullanıcısını ekle
INSERT INTO worker_tb (
  id, company_id, shop_id, first_name, last_name, email, 
  role, permissions, is_active, created_at, updated_at
)
SELECT 
  id, NULL, NULL, 'Gökçe', 'Oğuz', 'gokceoguz27@gmail.com',
  'brand_admin', '{}', true, NOW(), NOW()
FROM auth.users
WHERE email = 'gokceoguz27@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  role = 'brand_admin',
  company_id = NULL,
  is_active = true;
```

4. **"Run"** butonuna tıkla (veya Ctrl+Enter)

### 4️⃣ Doğrula
Aynı SQL Editor'da bu sorguyu çalıştır:

```sql
SELECT * FROM worker_tb WHERE email = 'gokceoguz27@gmail.com';
```

Sonuç:
- ✅ `role` = `'brand_admin'` olmalı
- ✅ `company_id` = `NULL` olmalı
- ✅ `is_active` = `true` olmalı

### 5️⃣ Giriş Yap
1. http://localhost:5173 adresini aç
2. Giriş bilgileri:
   ```
   Email: gokceoguz27@gmail.com
   Şifre: 123
   ```
3. **"Giriş Yap"** tıkla

---

## 🎉 Başarılı!

Artık admin paneline giriş yapabilir ve kafe ekleyebilirsiniz!

---

## 🔧 Hala Sorun Varsa

### "Email not confirmed" hatası:
```sql
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'gokceoguz27@gmail.com';
```

### "No company associated" hatası:
```sql
UPDATE worker_tb 
SET role = 'brand_admin', company_id = NULL, is_active = true
WHERE email = 'gokceoguz27@gmail.com';
```

### Kullanıcı bulunamıyor:
- Adım 2'yi tekrarla
- "Auto Confirm User" kutusunu işaretle
- Email'i doğru yaz: `gokceoguz27@gmail.com`

---

**Hazır!** 🚀
