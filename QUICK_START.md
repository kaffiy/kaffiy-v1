# 🚀 Kaffiy Admin - Hızlı Başlangıç

## 📋 Admin Giriş Bilgileri

```
Email: gokceoguz27@gmail.com
Şifre: 123
```

---

## ⚡ Hızlı Kurulum (3 Adım)

### 1️⃣ Supabase'de Kullanıcı Oluştur

1. https://supabase.com/dashboard/project/ivuhmjtnnhieguiblnbr
2. **Authentication** > **Users** > **Add User**
3. Bilgileri gir:
   - Email: `gokceoguz27@gmail.com`
   - Password: `123`
   - ✅ Auto Confirm User
4. **Create User**

### 2️⃣ Admin Rolü Ver

1. **SQL Editor** > **New Query**
2. Bu kodu çalıştır:

```sql
INSERT INTO worker_tb (
  id, email, name, role, company_id, created_at, updated_at
)
SELECT 
  id, 'gokceoguz27@gmail.com', 'Gökçe Oğuz', 'admin', NULL, NOW(), NOW()
FROM auth.users
WHERE email = 'gokceoguz27@gmail.com'
ON CONFLICT (id) DO NOTHING;
```

### 3️⃣ Giriş Yap

1. http://localhost:5173 (Kaffiy-Admin)
2. Email: `gokceoguz27@gmail.com`
3. Şifre: `123`
4. **Giriş Yap**

---

## ✅ Başarı Kontrolü

Giriş yaptıktan sonra:
- ✅ Admin paneli açılır
- ✅ "Yeni Kafe Ekle" butonu görünür
- ✅ Tüm kafeleri görebilirsiniz

---

## 🔧 Sorun mu Var?

### "Invalid login credentials"
```sql
-- Email'i onayla
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'gokceoguz27@gmail.com';
```

### "No company associated"
```sql
-- Admin rolünü kontrol et/düzelt
UPDATE worker_tb 
SET role = 'admin', company_id = NULL 
WHERE email = 'gokceoguz27@gmail.com';
```

---

## 📚 Detaylı Rehber

Daha fazla bilgi için: `ADMIN_SETUP_GUIDE.md`

---

**Hazır!** Artık tüm Kaffiy sistemini yönetebilirsiniz! 🎉
