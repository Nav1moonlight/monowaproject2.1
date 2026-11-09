# Dokumentasi REST API - MONOWA

Dokumentasi teknis endpoint REST API backend Monowa yang dibangun menggunakan Laravel 11 dan Laravel Sanctum Token Authentication.

---

## 1. Konsep Dasar & Standar API

- **Base URL**: `http://localhost:8000/api` (Pengembangan) atau `https://<domain-perusahaan>/api` (Produksi).
- **Format Pertukaran Data**: JSON (`Content-Type: application/json`, `Accept: application/json`).
- **Otentikasi**: Bearer Token via Header `Authorization: Bearer <token>`.
- **Standar Format Response**:
  ```json
  {
    "status": "success",
    "message": "Deskripsi pesan status",
    "data": { ... }
  }
  ```

---

## 2. Modul Autentikasi (Authentication)

### 2.1 Login Akun
- **Method**: `POST`
- **Endpoint**: `/api/login`
- **Rate Limit**: 10 request / menit
- **Request Body**:
  ```json
  {
    "email": "admin@limbah.local",
    "password": "password"
  }
  ```
- **Response Sukses (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Login berhasil",
    "token": "1|raNDomSanctumToKen...",
    "user": {
      "id": 1,
      "name": "Admin EHS",
      "email": "admin@limbah.local",
      "role": "ADMIN_EHS"
    }
  }
  ```

### 2.2 Profil User Saat Ini
- **Method**: `GET`
- **Endpoint**: `/api/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response Sukses (200 OK)**:
  ```json
  {
    "id": 1,
    "name": "Admin EHS",
    "email": "admin@limbah.local",
    "role": "ADMIN_EHS",
    "created_at": "2026-01-01T08:00:00.000000Z"
  }
  ```

### 2.3 Logout Akun
- **Method**: `POST`
- **Endpoint**: `/api/logout`
- **Headers**: `Authorization: Bearer <token>`
- **Response Sukses (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Berhasil keluar dan token dicabut."
  }
  ```

---

## 3. Modul Dashboard & Analitik

### 3.1 Ringkasan Metrik KPI
- **Method**: `GET`
- **Endpoint**: `/api/dashboard/summary`
- **Headers**: `Authorization: Bearer <token>`
- **Query Params (Opsional)**:
  - `start_date` (format: `YYYY-MM-DD`)
  - `end_date` (format: `YYYY-MM-DD`)
- **Response Sukses (200 OK)**:
  ```json
  {
    "data": {
      "kpi": {
        "b3_in_kg": 1450.5,
        "b3_out_kg": 980.0,
        "b3_balance_kg": 470.5,
        "domestic_total_kg": 3210.0,
        "domestic_organic_kg": 1820.0,
        "domestic_inorganic_kg": 1390.0,
        "tps_capacity_percentage": 58.8,
        "active_alerts_count": 2
      },
      "near_deadline_count": 1,
      "expired_count": 0
    }
  }
  ```

### 3.2 Tren Bulanan (Monthly Trends)
- **Method**: `GET`
- **Endpoint**: `/api/dashboard/monthly-trends`
- **Headers**: `Authorization: Bearer <token>`
- **Query Params**: `year` (contoh: `2026`)
- **Response Sukses (200 OK)**:
  ```json
  {
    "data": [
      {
        "month": "Jan",
        "b3_in": 1200,
        "b3_out": 800,
        "domestic_organic": 950,
        "domestic_inorganic": 600
      },
      {
        "month": "Feb",
        "b3_in": 1350,
        "b3_out": 1100,
        "domestic_organic": 1020,
        "domestic_inorganic": 680
      }
    ]
  }
  ```

### 3.3 Daftar Peringatan Masa Simpan (Storage Alerts)
- **Method**: `GET`
- **Endpoint**: `/api/dashboard/alerts`
- **Response Sukses (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": 12,
        "b3_transaction_id": 45,
        "waste_code": "B104d",
        "waste_name": "Kemasan Bekas B3",
        "alert_type": "H-7",
        "days_left": 5,
        "deadline_at": "2026-10-23",
        "is_active": true
      }
    ]
  }
  ```

---

## 4. Modul Transaksi Limbah B3

### 4.1 Mendapatkan Daftar Transaksi B3
- **Method**: `GET`
- **Endpoint**: `/api/b3-transactions`
- **Query Params**:
  - `page`: nomor halaman (default: `1`)
  - `per_page`: jumlah item per halaman (default: `25`)
  - `type`: filter tipe `IN` atau `OUT`
  - `start_date`: tanggal mulai `YYYY-MM-DD`
  - `end_date`: tanggal akhir `YYYY-MM-DD`
  - `search`: kata kunci pencarian kode limbah / manifest
- **Response Sukses (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": 1,
        "transaction_number": "B3-20261018-001",
        "date": "2026-10-18",
        "transaction_type": "IN",
        "waste_category_id": 2,
        "waste_code": "B107d",
        "waste_name": "Oli Bekas / Sludge",
        "weight_kg": 250.0,
        "package_type": "Drum Logam 200L",
        "package_count": 1,
        "storage_deadline_at": "2027-01-16",
        "manifest_number": null,
        "transporter_name": null,
        "status": "STORED"
      }
    ],
    "meta": {
      "current_page": 1,
      "total": 128
    }
  }
  ```

### 4.2 Tambah Transaksi B3 Baru
- **Method**: `POST`
- **Endpoint**: `/api/b3-transactions`
- **Role Yang Diizinkan**: `ADMIN_EHS`, `OPERATOR_TPS`
- **Request Body (Multipart Form Data atau JSON)**:
  ```json
  {
    "date": "2026-10-18",
    "transaction_type": "IN",
    "waste_category_id": 2,
    "waste_source_id": 1,
    "waste_code": "B107d",
    "waste_name": "Oli Bekas",
    "weight_kg": 200.5,
    "package_type": "Drum Logam",
    "package_count": 1,
    "notes": "Penerimaan dari Workshop Maintenance"
  }
  ```

### 4.3 Update Transaksi B3
- **Method**: `PUT` / `PATCH`
- **Endpoint**: `/api/b3-transactions/{id}`
- **Role Yang Diizinkan**: `ADMIN_EHS`, `OPERATOR_TPS`

### 4.4 Hapus Transaksi B3
- **Method**: `DELETE`
- **Endpoint**: `/api/b3-transactions/{id}`
- **Role Yang Diizinkan**: `ADMIN_EHS` (Hanya Administrator EHS)

---

## 5. Modul Transaksi Limbah Domestik

### 5.1 Mendapatkan Daftar Transaksi Domestik
- **Method**: `GET`
- **Endpoint**: `/api/domestic-transactions`
- **Query Params**:
  - `session`: `MORNING` atau `AFTERNOON`
  - `start_date`: filter tanggal mulai
  - `end_date`: filter tanggal akhir

### 5.2 Tambah Transaksi Domestik Baru
- **Method**: `POST`
- **Endpoint**: `/api/domestic-transactions`
- **Role Yang Diizinkan**: `ADMIN_EHS`, `OPERATOR_TPS`
- **Request Body**:
  ```json
  {
    "date": "2026-10-18",
    "session": "MORNING",
    "waste_category_id": 4,
    "waste_source_id": 2,
    "organic_weight_kg": 45.2,
    "inorganic_weight_kg": 30.8,
    "residue_weight_kg": 12.0,
    "processing_method": "TPS3R",
    "vehicle_plate_number": "B 9182 ABC",
    "notes": "Sesi pengangkutan pagi dari Kantin Utama"
  }
  ```

---

## 6. Modul Pengaturan & Sumber Limbah (Waste Sources)

- `GET /api/waste-sources`: Daftar titik sumber timbulan limbah fasilitas.
- `POST /api/waste-sources`: Tambah titik sumber baru (Admin/Operator).
- `PUT /api/waste-sources/{id}`: Ubah titik sumber limbah.
- `DELETE /api/waste-sources/{id}`: Hapus titik sumber limbah (Hanya Admin EHS).
- `GET /api/settings`: Ambil konfigurasi kapasitas TPS dan hari tenggat waktu default.
- `POST /api/settings`: Simpan konfigurasi sistem (Hanya Admin EHS).

---

## 7. Kode Status HTTP & Penanganan Kesalahan

| Kode HTTP | Arti | Skenario Penggunaan |
|---|---|---|
| `200 OK` | Sukses | Permintaan pembacaan atau update berhasil. |
| `201 Created` | Data Dibuat | Transaksi atau entitas baru berhasil disimpan. |
| `401 Unauthorized` | Belum Login | Token tidak disertakan atau telah kadaluwarsa. |
| `403 Forbidden` | Akses Ditolak | Peran user (misal: AUDITOR) tidak memiliki izin hapus/tulis. |
| `422 Unprocessable Entity`| Validasi Gagal | Bobot angka negatif, tanggal kosong, atau format salah. |
| `500 Server Error` | Gangguan Server | Kesalahan internal sistem / koneksi database. |
