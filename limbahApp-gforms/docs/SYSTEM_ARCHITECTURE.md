# Arsitektur Sistem - MONOWA (Monitoring Limbah & EHS System)

Dokumen ini mendokumentasikan arsitektur sistem, desain basis data, skema keamanan, serta mesin kepatuhan regulasi lingkungan pada aplikasi **Monowa**.

---

## 1. Ikhtisar Sistem (System Overview)

**Monowa** adalah sistem informasi manajemen dan monitoring limbah terpadu yang dirancang untuk mendukung departemen *Environment, Health, and Safety* (EHS) dan operator *Tempat Penyimpanan Sementara* (TPS) limbah. Sistem ini berfokus pada:
1. **Tata Kelola Limbah B3 (Bahan Berbahaya dan Beracun)** sesuai regulasi Kementerian Lingkungan Hidup dan Kehutanan (KLHK) / PP No. 22 Tahun 2021.
2. **Tata Kelola Limbah Domestik / Non-B3** dengan pencatatan berbasis sesi ritasi (pagi dan sore) serta pemilahan fraksi organik, anorganik, dan residu.
3. **Peringatan Dini Masa Simpan (Early Warning System)** untuk mencegah pelanggaran baku masa simpan limbah B3 (90, 180, dan 365 hari).
4. **Dashboard Eksekutif & Logbook Real-time** dengan visualisasi tren, utilisasi kapasitas TPS, dan transparansi data untuk kesiapan audit.

---

## 2. Arsitektur Komponen (High-Level Architecture)

Aplikasi dibangun menggunakan pola arsitektur **Decoupled Monolith (SPA with RESTful API)**:
- **Backend**: Laravel 11 bertindak sebagai penyedia API RESTful terpusat, pengelola otentikasi Sanctum, validasi bisnis, dan *scheduled task engine*.
- **Frontend**: React 19 + TypeScript yang dibundel menggunakan Vite 8 dan di-inject secara native ke dalam lifecycle Laravel Blade melalui `@viteReactRefresh`.
- **Database**: MySQL 8.0+ (atau SQLite pada lingkungan pengujian lokal).
- **Styling**: Tailwind CSS v4 dengan sistem token desain kustom multi-tema.

```mermaid
graph TD
    subgraph ClientLayer["Frontend Layer (Client Browser)"]
        UI["React 19 SPA (TypeScript)"]
        Theme["Theme Engine (6 Variasi + RTL AR/ID)"]
        State["State & Context (Auth, Toast, Data)"]
        UI --> State
        UI --> Theme
    end

    subgraph GatewayLayer["Routing & Middleware Layer"]
        WebRoute["Web Routes (Blade Bootstrap)"]
        ApiRoute["API Routes (/api/*)"]
        Sanctum["Sanctum Token Auth Middleware"]
        RoleCheck["EnsureUserRole Middleware (RBAC)"]
        ApiRoute --> Sanctum --> RoleCheck
    end

    subgraph ServiceLayer["Application Business Logic Layer"]
        AuthController["AuthController"]
        B3Service["B3TransactionService"]
        DomesticService["DomesticTransactionService"]
        DashService["DashboardService (Cached Metrics)"]
        CronAlert["Artisan Command: limbah:check-alerts"]
    end

    subgraph PersistenceLayer["Database & Storage"]
        MySQL[("MySQL 8.0+ Database")]
        FileStorage[("Public Disk: Scale Photos")]
    end

    ClientLayer -->|"HTTP / REST API (JSON)"| GatewayLayer
    RoleCheck --> AuthController
    RoleCheck --> B3Service
    RoleCheck --> DomesticService
    RoleCheck --> DashService
    CronAlert --> B3Service

    B3Service --> MySQL
    B3Service --> FileStorage
    DomesticService --> MySQL
    DashService --> MySQL
```

---

## 3. Entity Relationship Diagram (ERD)

Struktur relasi data dalam Monowa dirancang normal dan dilengkapi audit trail (`created_by`, `updated_by`):

```mermaid
erDiagram
    USERS ||--o{ B3_TRANSACTIONS : "records/updates"
    USERS ||--o{ DOMESTIC_TRANSACTIONS : "records/updates"
    USERS ||--o{ WASTE_SOURCES : "creates"
    
    WASTE_CATEGORIES ||--o{ B3_TRANSACTIONS : "categorizes"
    WASTE_CATEGORIES ||--o{ DOMESTIC_TRANSACTIONS : "categorizes"
    
    WASTE_SOURCES ||--o{ B3_TRANSACTIONS : "originates"
    WASTE_SOURCES ||--o{ DOMESTIC_TRANSACTIONS : "originates"
    
    B3_TRANSACTIONS ||--o{ STORAGE_ALERTS : "triggers"
    B3_TRANSACTIONS ||--o{ NOTIFICATIONS : "generates"

    USERS {
        bigint id PK
        string name
        string email UK
        string password
        enum role "ADMIN_EHS, OPERATOR_TPS, AUDITOR"
        timestamp created_at
    }

    WASTE_CATEGORIES {
        bigint id PK
        string code UK
        string name
        enum type "B3, DOMESTIC"
        string sub_category
        int default_storage_limit_days
    }

    WASTE_SOURCES {
        bigint id PK
        string code UK
        string name
        string department
        string pic_name
        boolean is_active
    }

    B3_TRANSACTIONS {
        bigint id PK
        string transaction_number UK
        date date
        enum transaction_type "IN, OUT"
        bigint waste_category_id FK
        bigint waste_source_id FK
        string waste_code
        string waste_name
        decimal weight_kg
        string package_type
        int package_count
        date storage_deadline_at
        string manifest_number
        string transporter_name
        string transporter_plate_number
        string scale_photo_path
        enum status "PENDING, STORED, COMPLETED, DISPOSED"
        bigint created_by FK
    }

    DOMESTIC_TRANSACTIONS {
        bigint id PK
        date date
        enum session "MORNING, AFTERNOON"
        bigint waste_category_id FK
        bigint waste_source_id FK
        decimal organic_weight_kg
        decimal inorganic_weight_kg
        decimal residue_weight_kg
        decimal total_weight_kg
        enum processing_method "TPS3R, BANK_SAMPAH, LANDFILL, COMPOSTING"
        string vehicle_plate_number
        bigint created_by FK
    }

    STORAGE_ALERTS {
        bigint id PK
        bigint b3_transaction_id FK
        enum alert_type "H-30, H-7, EXPIRED"
        date deadline_at
        boolean is_active
        timestamp triggered_at
        timestamp acknowledged_at
    }

    NOTIFICATIONS {
        bigint id PK
        string type
        string title
        text message
        string reference_type
        bigint reference_id
        boolean is_read
    }
```

---

## 4. Mesin Kepatuhan Masa Simpan (Compliance Engine)

Sesuai regulasi limbah berbahaya di Indonesia:
- **Kategori 1**: Batas penyimpanan maksimal **90 hari**.
- **Kategori 2 (Sumber Tidak Spesifik / Spesifik Umum)**: Batas simpan **180 hari** atau **365 hari** (apabila laju timbulan < 50 kg/hari).

### Logika Penghitungan Otomatis
1. Saat operator menginput limbah B3 Masuk (`transaction_type = IN`), sistem menghitung batas tenggat waktu:
   $$\text{storage\_deadline\_at} = \text{tanggal\_masuk} + \text{kategori.default\_storage\_limit\_days}$$
2. Perintah terjadwal (`CheckB3Alerts` / `php artisan limbah:check-alerts`) dieksekusi secara otomatis setiap hari pada jam 00:00:
   - **H-30**: Jika sisa hari $\le 30$ hari $\rightarrow$ Terbitkan peringatan status **Waspada**.
   - **H-7**: Jika sisa hari $\le 7$ hari $\rightarrow$ Terbitkan peringatan status **Kritis** (Segera jadwalkan pengangkutan pihak ke-3).
   - **EXPIRED**: Jika tanggal hari ini $>$ `storage_deadline_at` $\rightarrow$ Terbitkan peringatan status **Pelanggaran Regulasi**.

---

## 5. Matriks Keamanan & Akses (RBAC)

Sistem menggunakan middleware `EnsureUserRole` untuk mengisolasi fungsionalitas berdasarkan peran kerja:

| Modul / Kemampuan | Admin EHS | Operator TPS | Auditor (Pengawas) |
|---|:---:|:---:|:---:|
| Akses Dashboard & Logbook | ✅ Full | ✅ Full | ✅ Read-Only |
| Input Transaksi B3 (Masuk/Keluar) | ✅ Ya | ✅ Ya | ❌ Tidak |
| Input Transaksi Domestik | ✅ Ya | ✅ Ya | ❌ Tidak |
| Edit Transaksi Hari Berjalan | ✅ Ya | ✅ Ya | ❌ Tidak |
| Hapus Riwayat Transaksi | ✅ Ya (Otoritas Penuh) | ❌ Tidak | ❌ Tidak |
| Kelola Sumber Limbah (Waste Sources) | ✅ Ya | ✅ Ya | ❌ Read-Only |
| Konfigurasi Ambang Batas & Sistem | ✅ Ya | ❌ Tidak | ❌ Tidak |
| Acknowledge / Tutup Alert B3 | ✅ Ya | ✅ Ya | ❌ Tidak |
| Export Data (Excel, CSV, PDF Report) | ✅ Ya | ✅ Ya | ✅ Ya |

---

## 6. Desain Antarmuka Pengguna & Theme Engine

Frontend Monowa dirancang dengan filosofi **Industrial UX**:
- **Dukungan 6 Tema Tampilan**:
  1. *Corporate*: Tema standar korporat bernuansa clean slate/blue.
  2. *Frosted*: Glassmorphism modern dengan backdrop blur.
  3. *Liquid*: Nuansa fluida transisi dinamis.
  4. *Flat*: Desain minimalis tanpa ornamen berat untuk kecepatan render tinggi.
  5. *High Contrast*: Memenuhi standar aksesibilitas WCAG untuk kondisi pencahayaan terik di TPS.
  6. *Night City*: Tema gelap beraksen cyberpunk neon untuk monitoring shift malam.
- **Dukungan Multi-Bahasa**:
  - Bahasa Indonesia (ID) sebagai bahasa operasional utama.
  - Bahasa Arab (AR) dilengkapi transformasi tata letak **RTL (Right-to-Left)** otomatis.
- **Desain Adaptif Perangkat**:
  - Desktop: Sidebar penuh dengan logbook interaktif dan filter multi-kolom.
  - Tablet/Ponsel Lapangan: Navigasi bawah (*Mobile Bottom Bar*) dengan form penimbangan cepat yang ramah sentuhan.
