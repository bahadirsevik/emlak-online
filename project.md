# Instagram Automated Post Management System (Gravity)

## 📌 Proje Genel Bakış
**Gravity**, Instagram hesap yönetimi, içerik otomasyonu ve potansiyel müşteri (lead) oluşturma süreçlerini tek bir merkezden yönetmeyi sağlayan kapsamlı bir full-stack web uygulamasıdır. Kullanıcıların içerik oluşturma, planlama, yayınlama ve performans analizi gibi görevleri otomatize etmelerine yardımcı olurken, yapay zeka desteği ile içerik üretimini hızlandırır.

Proje, modern web teknolojileri kullanılarak geliştirilmiş olup, ölçeklenebilir bir mimariye sahiptir.

## 🏗️ Teknoloji Yığını (Tech Stack)

### Backend (Sunucu Tarafı)
- **Runtime:** Node.js
- **Framework:** Express.js (REST API mimarisi)
- **Dil:** TypeScript
- **Veritabanı:** PostgreSQL (ilişkisel veritabanı)
- **IRM (Object-Relational Mapping):** Prisma ORM
- **Cache & Kuyruk Yönetimi:** Redis & BullMQ (Arka plan işleri ve zamanlanmış görevler için)
- **Web Scraping & Otomasyon:** Puppeteer (Web tarayıcı otomasyonu için)
- **Güvenlik:** Helmet, CORS, Rate Limiting, BCrypt (Şifreleme), JWT (Kimlik Doğrulama)
- **AI Entegrasyonu:** OpenAI API & DeepSeek (İçerik ve metin üretimi için)
- **Dosya Depolama:** Cloudinary (Görsel ve medya yönetimi)

### Frontend (İstemci Tarafı)
- **Kütüphane:** React 19
- **Build Tool:** Vite (Hızlı geliştirme ve derleme için)
- **Stil:** Tailwind CSS (Modern ve responsif tasarım)
- **Dil:** TypeScript
- **State Yönetimi & Veri:** React Hooks
- **Routing:** React Router DOM
- **Görselleştirme:** Recharts (Grafik ve analitik veriler için)
- **İkonlar:** Lucide React
- **Tarih Yönetimi:** Date-fns

## 🚀 Temel Özellikler

### 1. Kimlik Doğrulama ve Kullanıcı Yönetimi
- Güvenli giriş (Login) ve kayıt (Register) işlemleri.
- JWT tabanlı oturum yönetimi.
- Kullanıcı ve yönetici (Admin) rolleri.

### 2. Dashboard (Kontrol Paneli)
- Hesabın genel durumunu gösteren özet kartlar.
- Performans metrikleri ve hızlı erişim menüleri.

### 3. İçerik Oluşturma ve Yönetimi (Create Post)
- **AI Destekli İçerik:** Yapay zeka ile otomatik caption (açıklama) ve hashtag önerileri.
- **Görsel Düzenleme:** Entegre görsel düzenleyici ile fotoğrafları kırpma, filtreleme ve düzenleme.
- **Şablonlar:** Sık kullanılan post formatları için şablon yönetimi.

### 4. Zamanlama ve Takvim (Calendar)
- Sürükle-bırak destekli görsel takvim arayüzü.
- İleri tarihli gönderileri planlama ve otomatik yayınlama.
- Yayınlanmış ve beklemedeki gönderilerin takibi.

### 5. Otomasyon ve Arka Plan İşleri
- **BullMQ & Redis:** Gönderilerin belirlenen saatte sorunsuz yayınlanması için kuyruk sistemi.
- **Instagram Scraper:** Rakip analizi veya veri toplama için Puppeteer tabanlı kazıyıcılar.

### 6. Analitik ve Raporlama (Analytics)
- Takipçi büyümesi, etkileşim oranları ve gönderi performanslarının grafiksel gösterimi.
- Detaylı istatistikler ile strateji geliştirme imkanı.

### 7. Lead Generation (Potansiyel Müşteri Yönetimi)
- Instagram üzerinden potansiyel müşterileri bulma ve listeleme.
- CRM benzeri bir yapı ile lead takibi.

### 8. Yönetici Paneli (Admin Dashboard)
- Sistem genelindeki kullanıcıları ve aktiviteleri izleme.
- Sistem ayarları ve yapılandırmaları.

## 📂 Proje Yapısı

### Backend (`src/`)
- **`config/`**: Çevresel değişkenler ve yapılandırma dosyaları.
- **`controllers/`**: API isteklerini işleyen fonksiyonlar.
- **`models/`**: Veritabanı modelleri ve şemalar.
- **`routes/`**: API endpoint tanımları (`/api/auth`, `/api/posts`, vb.).
- **`services/`**: İş mantığının bulunduğu servis katmanı (Business Logic).
- **`workers/`**: Arka planda çalışan kuyruk işçileri (Post Worker).
- **`prisma/`**: Veritabanı şeması (`schema.prisma`) ve migrasyonlar.

### Frontend (`client/src/`)
- **`pages/`**: Uygulama sayfaları (`Dashboard`, `Leads`, `Calendar`, vb.).
- **`components/`**: Yeniden kullanılabilir UI bileşenleri.
- **`hooks/`**: Özel React hook'ları (`useInstagram`, vb.).
- **`context/`**: Global state yönetimi.
- **`assets/`**: Statik dosyalar ve görseller.

## 🛠️ Kurulum ve Çalıştırma

Geliştirme ortamında projeyi çalıştırmak için:

1.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    cd client && npm install
    ```

2.  **Veritabanını Hazırlayın:**
    PostgreSQL ve Redis servislerinin çalıştığından emin olun.
    ```bash
    npm run migrate:dev
    ```

3.  **Uygulamayı Başlatın:**
    Kök dizinde:
    ```bash
    npm run dev
    ```
    Bu komut hem backend sunucusunu hem de frontend uygulamasını eş zamanlı olarak başlatır.
