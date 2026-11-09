# Panduan Pengguna (User Manual) - MONOWA

Sistem Pemantauan dan Tata Kelola Limbah Terpadu (Limbah B3 & Domestik)

---

## 1. Pendahuluan

**Monowa** hadir untuk menyederhanakan pencatatan limbah manual berbasis kertas/buku logbook menjadi sistem terdigitalisasi, real-time, dan siap audit (*audit-ready*). Panduan ini memandu pengguna dalam mengoperasikan modul-modul sistem sesuai dengan tugas dan tanggung jawab masing-masing.

---

## 2. Hak Akses & Peran Pengguna (User Roles)

Sistem membedakan fungsi berdasarkan peran kerja:

1. **Admin EHS (Environmental, Health & Safety Manager)**:
   - Bertanggung jawab atas verifikasi data, penghapusan transaksi jika terjadi kekeliruan fatal, pengelolaan akun & master sumber limbah, konfigurasi kapasitas TPS, dan koordinasi dengan pihak transporter eksternal berizin KLHK.
2. **Operator TPS (Tempat Penyimpanan Sementara)**:
   - Bertugas di lapangan/timbangan untuk mencatat penimbangan limbah harian (Masuk & Keluar), mengunggah foto bukti timbangan fisik, dan memantau sesi ritasi limbah domestik pagi & sore.
3. **Auditor / Pengawas Lingkungan**:
   - Memiliki akses *Read-Only* untuk meninjau logbook kepatuhan, memeriksa nomor manifest & masa simpan limbah, melihat grafik tren, dan mencetak laporan resmi tanpa risiko mengubah data historis.

---

## 3. Langkah Demi Langkah Pengoperasian

### 3.1 Masuk ke Sistem (Login)
1. Buka peramban (browser) dan akses alamat aplikasi Monowa.
2. Masukkan alamat **Email** dan **Kata Sandi**.
3. Klik tombol **Masuk**. Sistem akan menampilkan halaman utama sesuai hak akses Anda.

---

### 3.2 Pencatatan Transaksi Limbah B3 Masuk (B3 IN)
Gunakan modul ini ketika departemen/unit kerja menghasilkan limbah B3 dan menyerahkannya ke TPS:
1. Klik menu **Limbah B3 Masuk** pada navigasi sidebar atau tombol aksi cepat di Dashboard.
2. Isi formulir pencatatan:
   - **Tanggal Masuk**: Pilih tanggal penyerahan limbah.
   - **Sumber Limbah (Area / Dept)**: Pilih sumber asal limbah (contoh: *Workshop Maintenance*, *Lab Kimia*, *Area Produksi A*).
   - **Jenis / Nama Limbah B3**: Pilih kategori atau ketikkan jenis limbah (contoh: *Oli Bekas*, *Majun Terkontaminasi*, *Lampu TL Bekas*).
   - **Kode Limbah**: Masukkan kode baku (misal: *B107d*, *B110d*).
   - **Berat (Kg)**: Masukkan hasil penimbangan netto.
   - **Bentuk Kemasan & Jumlah**: Contoh: *1 Drum Logam 200L* atau *2 Jerigen 20L*.
   - **Foto Bukti Timbangan**: Ambil foto timbangan atau dokumen penyerahan melalui kamera perangkat atau unggah file gambar.
3. Klik **Simpan Transaksi**.
4. Sistem secara otomatis menghitung **Batas Maksimal Penyimpanan** (contoh: 90 hari atau 180 hari ke depan) dan menerbitkan notifikasi logbook.

---

### 3.3 Pencatatan Transaksi Limbah B3 Keluar (B3 OUT / Dispatched)
Gunakan modul ini ketika limbah B3 diangkut oleh pihak ketiga pengolah/pemanfaat berizin KLHK:
1. Klik menu **Limbah B3 Keluar**.
2. Masukkan rincian pengangkutan:
   - **Tanggal Pengangkutan**: Tanggal penyerahan ke transporter.
   - **Nomor Manifest / Festronik**: Masukkan kode manifest resmi KLHK.
   - **Nama Perusahaan Transporter**: Nama vendor pengangkut berizin (contoh: *PT Waste Transport Indonesia*).
   - **Nomor Polisi Kendaraan**: Nomor plat truk pengangkut.
   - **Jumlah / Berat Limbah Keluar**: Berat netto yang diangkut.
3. Klik **Konfirmasi Pengangkutan**. Status lot limbah akan diperbarui menjadi **COMPLETED / DISPOSED**.

---

### 3.4 Pencatatan Limbah Domestik (Sesi Pagi & Sore)
Pengelolaan limbah non-B3 dipisahkan per sesi kerja:
1. Klik menu **Limbah Domestik**.
2. Pilih sesi ritasi: **Sesi Pagi (08:00 - 10:00)** atau **Sesi Sore (15:00 - 17:00)**.
3. Masukkan rincian berat hasil pemilahan:
   - **Fraksi Organik (Kg)**: Sisa makanan, daun, bahan kompos.
   - **Fraksi Anorganik (Kg)**: Kertas, plastik, kaleng, kardus bernilai daur ulang.
   - **Residu (Kg)**: Sampah yang tidak dapat diolah dan harus dikirim ke TPA.
4. Pilih metode pengolahan: *TPS3R*, *Bank Sampah*, *Komposting*, atau *Landfill*.
5. Klik **Simpan Data Domestik**.

---

### 3.5 Memahami Peringatan Dini Masa Simpan (Storage Alerts)
Pada halaman Dashboard dan menu Limbah B3, sistem memberikan indikator warna:
- 🟢 **Aman (Hijau)**: Sisa masa simpan $> 30$ hari.
- 🟡 **Waspada H-30 (Kuning)**: Sisa waktu simpan $\le 30$ hari. Segera hubungi vendor transporter untuk penjadwalan pengambilan.
- 🟠 **Kritis H-7 (Oranye)**: Sisa waktu simpan $\le 7$ hari. Pengangkutan harus segera dilaksanakan minggu ini.
- 🔴 **Expired / Lewat Tenggat (Merah)**: Melebihi batas maksimal regulasi. Harus segera dibuatkan berita acara penanganan darurat EHS.

---

### 3.6 Mengubah Tampilan & Bahasa
Monowa mendukung personalisasi antarmuka:
1. Klik menu **Pengaturan (Settings)** atau ikon palet tema di bagian atas (Header).
2. **Pilihan Tema**:
   - Pilih dari 6 tema: *Corporate*, *Frosted Glass*, *Liquid*, *Flat Minimalist*, *High Contrast*, atau *Night City*.
3. **Pilihan Mode**:
   - Pilih *Mode Terang (Light)*, *Mode Gelap (Dark)*, atau *AMOLED Pure Black*.
4. **Pilihan Bahasa**:
   - Pilih antara **Bahasa Indonesia (ID)** atau **Bahasa Arab (AR)**. Tata letak secara otomatis menyesuaikan arah teks (*Left-to-Right* atau *Right-to-Left*).

---

### 3.7 Ekspor Laporan
1. Pada halaman logbook transaksi, gunakan tombol **Export**:
   - **Export CSV / Excel**: Mengunduh seluruh baris data transaksi untuk keperluan olah data statistik.
   - **Print / PDF Summary**: Mencetak format laporan siap tanda tangan untuk lampiran pelaporan semesteran ke Dinas Lingkungan Hidup (DLH) atau KLHK.
