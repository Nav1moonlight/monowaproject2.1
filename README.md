# Monowa - Smart Waste & EHS Monitoring System

Sistem pemantauan dan pengelolaan limbah fasilitas (B3 & Domestik) dengan dashboard real-time yang dibangun menggunakan **Laravel 11 + React 19 + Tailwind CSS v4**. Sistem ini mengintegrasikan frontend React dengan REST API Laravel & Database MySQL secara terpusat.

---

## 📚 Dokumentasi Proyek

Telah disediakan dokumentasi teknis dan panduan komprehensif dalam direktori [`docs/`](docs/):

1. 🏛️ **[Arsitektur Sistem (SYSTEM_ARCHITECTURE.md)](docs/SYSTEM_ARCHITECTURE.md)**: Arsitektur aplikasi, diagram alir komponen, ERD database, mesin kepatuhan regulasi (compliance engine), dan RBAC matrix.
2. 🔌 **[Dokumentasi REST API (API_DOCUMENTATION.md)](docs/API_DOCUMENTATION.md)**: Spesifikasi endpoint RESTful, format request/response, autentikasi Sanctum, dan kode status.
3. 📖 **[Panduan Pengguna / User Manual (USER_MANUAL.md)](docs/USER_MANUAL.md)**: Panduan operasional penimbangan B3 masuk/keluar, domestik sesi pagi/sore, penanganan alert, dan kustomisasi tema.
4. 🚀 **[Panduan Deployment Produksi (DEPLOYMENT_GUIDE.md)](docs/DEPLOYMENT_GUIDE.md)**: Panduan instalasi di server produksi Linux Ubuntu/Nginx/MySQL, setup cron scheduler, dan optimasi build.
5. 📊 **[Slide Presentasi Proyek (PRESENTATION.md)](docs/PRESENTATION.md)**: Naskah dan susunan slide presentasi lengkap untuk stakeholder/manajemen (kompatibel dengan Marp / Slidev / PPTX), dilengkapi speaker notes dan analisis ROI.

---

## 📋 Requirement

- **PHP** 8.2 atau lebih tinggi (Rekomendasi PHP 8.3+)
- **Node.js** 18 atau lebih tinggi (Rekomendasi Node 22+)
- **npm** 9 atau lebih tinggi
- **Composer** 2.0 atau lebih tinggi
- **Database**: MySQL 8.0+ atau MariaDB 10.5+
- **Git**

---

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd limbahApp
```

### 2. Install Dependencies

#### Backend (Laravel + PHP)
```bash
composer install
```

#### Frontend (Node.js)
```bash
npm install
```

### 3. Setup Environment

Buat file `.env` dari template:
```bash
cp .env.example .env
```

Generate application key:
```bash
php artisan key:generate
```

Update konfigurasi database di file `.env`:
```env
APP_NAME="Limbah App"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=limbahapp
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Setup Database & Seeder

Buat database MySQL:
```sql
CREATE DATABASE limbahapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Jalankan migrations dan seeders data awal:
```bash
php artisan migrate --seed
```

### 5. Jalankan Aplikasi

Jalankan server dalam dua jendela terminal tersendiri:

**Terminal 1 - Vite Dev Server (Hot Reload):**
```bash
npm run dev
```

**Terminal 2 - Laravel Server:**
```bash
php artisan serve
```

Buka browser di alamat: **`http://localhost:8000`**

---

## 📁 Project Structure

```
limbahApp/
├── app/                     # Controller API, Model, Service, & Resource Laravel
│   ├── Http/Controllers/Api # API Controllers (Dashboard, B3, Domestic, Notifications)
│   ├── Http/Resources/      # JSON API Serializers
│   ├── Models/              # Eloquent Models (B3Transaction, DomesticTransaction, etc.)
│   └── Services/            # Business Logic Services
├── database/                # Migrations & Seeders
├── resources/
│   ├── css/                 # Tailwind CSS styles
│   ├── js/                  # Laravel entry point (React createRoot)
│   ├── views/               # Blade template (welcome.blade.php + @viteReactRefresh)
│   └── frontend/            # Aplikasi React + TypeScript
│       └── src/
│           ├── api.ts       # API Integration Service (fetch wrapper)
│           ├── components/  # React Components (Dashboard, B3Page, DomesticPage, etc.)
│           ├── context.tsx  # Global State Management & Theme Context
│           ├── data.ts      # Fallback Data & Interfaces
│           ├── i18n.ts      # Internationalization (ID, AR)
│           └── theme.ts     # Multi-theme design tokens
├── routes/
│   ├── api.php              # REST API Routes (/api/*)
│   └── web.php              # Web Route (serving React SPA)
├── vite.config.js           # Vite + Laravel plugin configuration
├── package.json             # Frontend dependencies
└── composer.json            # PHP dependencies
```

---

## 🔌 API Endpoints

Aplikasi ini menggunakan REST API bawaan Laravel (`/api/*`):

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/api/dashboard/summary` | Ringkasan metrik KPI, statistik B3, Domestik, & Alert |
| `GET` | `/api/dashboard/monthly-trends` | Data tren bulanan limbah B3 & Domestik |
| `GET` | `/api/b3-transactions` | Daftar transaksi Limbah B3 (dengan filter & pagination) |
| `POST` | `/api/b3-transactions` | Menambah transaksi B3 baru ke database |
| `GET` | `/api/domestic-transactions` | Daftar transaksi Limbah Domestik (Sesi Pagi & Sore) |
| `POST` | `/api/domestic-transactions` | Menambah transaksi Domestik baru ke database |
| `GET` | `/api/waste-categories` | Daftar kategori limbah B3 & Domestik |
| `GET` | `/api/notifications` | Notifikasi & alert sistem |

---

## 🔧 Development Commands

### Frontend (React + Vite)
```bash
npm run dev       # Jalankan server Vite dengan Hot Module Replacement (HMR)
npm run build     # Kompilasi aset produksi (production build)
```

### Backend (Laravel)
```bash
php artisan migrate              # Jalankan migrasi tabel database
php artisan db:seed              # Isi database dengan data sampel seeder
php artisan serve                # Jalankan server development Laravel
php artisan test                 # Jalankan unit & feature tests
```

---

## 🐛 Troubleshooting

### Layar Blank Saat Membuka Aplikasi

**Penyebab & Solusi**:
1. **React Preamble Missing**: Pastikan directive `@viteReactRefresh` sudah terpasang sebelum `@vite(...)` di `resources/views/welcome.blade.php`.
2. **Vite Server Belum Running**: Pastikan `npm run dev` aktif di Terminal 1.
3. **Cache Laravel**: Jalankan pembersihan cache:
   ```bash
   php artisan cache:clear
   php artisan config:clear
   php artisan view:clear
   ```

### Runtime TypeError / Undefined Property

Jika terjadi layar blank saat membuka halaman seperti *Limbah B3*, pastikan data yang dipetakan dari API memiliki nilai *fallback* dan mendukung *null-safety* `(amountKg ?? weightKg ?? 0).toFixed(1)`.

---

## 🎨 Fitur Utama

- ✅ **Live MySQL Integration**: Tersambung langsung ke database backend via REST API.
- ✅ **Dashboard Analytics**: Grafik perbandingan B3 Masuk/Keluar & Domestik Organik/Anorganik.
- ✅ **Multi-Theme Support**: Corporate, Frosted, Liquid, Flat, High Contrast, dan Night City.
- ✅ **Dark & Light Mode**: Dukungan mode Terang, Gelap, dan AMOLED.
- ✅ **Monitoring Limbah B3**: Tracking manifest, transporter, batas penyimpanan, & peringatan alert.
- ✅ **Manajemen Limbah Domestik**: Monitoring sesi Pagi & Sore.
- ✅ **Multi-Language Support**: Dukungan Bahasa Indonesia (ID) & Arab (AR).

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend Framework | Laravel | 11 |
| Programming Language | PHP | 8.2+ (PHP 8.3 Tested) |
| Frontend Library | React | 19 |
| Language | TypeScript | 5.7 |
| Styling | Tailwind CSS | 4 |
| Build Tool | Vite | 8 |
| Charting | Recharts | 3.10 |
| Database | MySQL / MariaDB | 8.0+ |

---

## 📄 License & Status

- **Last Updated**: 2026-07-27  
- **Status**: Active Development  
- **Owner**: EHS Division
