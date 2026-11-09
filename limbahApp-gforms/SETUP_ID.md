# Panduan Setup Limbah App

Dokumentasi lengkap untuk setup dan menjalankan Limbah App untuk development.

## 📋 Prasyarat

Sebelum mulai, pastikan sudah install:

1. **PHP 8.2+**
   - Windows: [php.net](https://www.php.net/downloads) atau via Laragon
   - macOS: `brew install php`
   - Linux: `sudo apt install php8.2 php8.2-{mysql,gd,bcmath,curl,dom}`

2. **Composer** (PHP Dependency Manager)
   - Cek: `composer --version`
   - Install: https://getcomposer.org/download/

3. **Node.js & npm** (v18+)
   - Cek: `node --version && npm --version`
   - Install: https://nodejs.org/
   - Atau gunakan `nvm`: https://github.com/nvm-sh/nvm

4. **MySQL 8.0+**
   - Windows: [MySQL Installer](https://dev.mysql.com/downloads/installer/) atau Laragon
   - macOS: `brew install mysql`
   - Linux: `sudo apt install mysql-server`
   - Cek: `mysql --version`

5. **Git**
   - Windows: [Git for Windows](https://git-scm.com/download/win)
   - macOS: `brew install git`
   - Cek: `git --version`

## 🚀 Step-by-Step Setup

### Step 1: Clone Repository

Buka terminal/command prompt di folder project Anda:

```bash
git clone <repository-url>
cd limbahApp
```

### Step 2: Install Backend Dependencies (Composer)

```bash
composer install
```

Proses ini akan:
- Download semua PHP package yang diperlukan Laravel
- Membuat folder `vendor/`
- Setup autoloader

**Jika error**: Pastikan PHP path sudah benar di environment variable

### Step 3: Install Frontend Dependencies (npm)

```bash
npm install
```

Proses ini akan:
- Download React, Tailwind, dan package lainnya
- Membuat folder `node_modules/`
- Membuat `package-lock.yaml`

Ini mungkin memakan waktu 2-5 menit.

### Step 4: Setup Environment File

Buat file `.env` dari template:

**Windows (Command Prompt):**
```cmd
copy .env.example .env
```

**macOS/Linux/Git Bash:**
```bash
cp .env.example .env
```

Kemudian buka `.env` dan update konfigurasi penting:

```env
APP_NAME="Limbah App"
APP_URL=http://localhost:8000
DB_DATABASE=limbah_app
DB_USERNAME=root
DB_PASSWORD=
```

### Step 5: Generate Application Key

```bash
php artisan key:generate
```

Ini akan:
- Generate encryption key untuk Laravel
- Update field `APP_KEY` di `.env`

**Jika gagal**: Pastikan PHP sudah ter-install

### Step 6: Setup Database

#### Create Database (MySQL)

**Windows (Command Prompt):**
```cmd
mysql -u root -p
```

Akan minta password MySQL Anda, kemudian:

```sql
CREATE DATABASE limbah_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

**macOS/Linux:**
```bash
mysql -u root -p -e "CREATE DATABASE limbah_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

#### Run Migrations

```bash
php artisan migrate
```

Ini akan membuat semua table yang diperlukan di database.

### Step 7: Jalankan Aplikasi

**Terminal 1 - Jalankan Vite Dev Server (untuk hot reload React):**

```bash
npm run dev
```

Output akan terlihat seperti:
```
VITE v8.1.5  ready in 234 ms

➜  Local:   http://localhost:5173/
```

**JANGAN tutup terminal ini**, biarkan terus running!

**Terminal 2 - Jalankan Laravel Development Server:**

Buka terminal baru dan jalankan:

```bash
php artisan serve
```

Output akan terlihat seperti:
```
Laravel development server started: http://127.0.0.1:8000
```

### Step 8: Buka di Browser

Kunjungi: **http://localhost:8000**

Jika melihat halaman Limbah App dengan dashboard yang sudah di-load, berarti setup BERHASIL! ✅

## 🔧 Mengatasi Layar Blank

Jika hanya melihat layar blank atau error:

### Checklist:

1. **Cek Terminal npm run dev**
   - Pastikan Terminal 1 masih running dan tidak ada error
   - Jika ada error, cari tahu pesan errornya

2. **Cek Terminal php artisan serve**
   - Pastikan Terminal 2 masih running
   - Tidak ada "Address already in use" error

3. **Clear Cache Laravel**
   ```bash
   php artisan cache:clear
   php artisan config:clear
   php artisan view:clear
   ```

4. **Buka Browser Console (F12)**
   - Tekan F12 → Tab "Console"
   - Cari error messages merah
   - Screenshot error dan tanyakan ke team

5. **Rebuild Assets**
   ```bash
   # Tekan Ctrl+C di Terminal 1 untuk stop
   npm run build
   npm run dev
   ```

6. **Check Database Connection**
   ```bash
   php artisan tinker
   >>> DB::connection()->getPdo()
   ```
   Jika ada error, DB tidak terhubung

## 📚 Development Workflow

### Ketika Mengembangkan

**3 Terminal harus berjalan:**

1. **Terminal 1 (Vite Dev Server)** - untuk hot reload React
   ```bash
   npm run dev
   ```

2. **Terminal 2 (Laravel Server)** - untuk backend API
   ```bash
   php artisan serve
   ```

3. **Terminal 3 (Opsional - untuk Git/Commands)**
   ```bash
   git status
   php artisan tinker
   ```

### Edit File

- Edit file `.tsx` atau `.ts` di `resources/frontend/src/` → Auto reload di browser
- Edit file `.php` di `app/` → Refresh browser manual
- Edit `.env` → Restart Laravel server

## 🛠️ Useful Commands

### Frontend (React + Vite)

```bash
# Development dengan hot reload
npm run dev

# Production build
npm run build

# Format code
npm run format
```

### Backend (Laravel)

```bash
# Start development server
php artisan serve

# Access Laravel REPL (untuk testing)
php artisan tinker

# Create new model + migration
php artisan make:model Post --migration

# Create new controller
php artisan make:controller PostController

# Run database migrations
php artisan migrate

# Rollback last migration
php artisan migrate:rollback

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# Optimize for production
php artisan optimize:clear
php artisan config:cache
```

### Database (MySQL)

```bash
# Login ke MySQL
mysql -u root -p

# List databases
SHOW DATABASES;

# Select database
USE limbah_app;

# List tables
SHOW TABLES;

# Backup database
mysqldump -u root -p limbah_app > backup.sql

# Restore database
mysql -u root -p limbah_app < backup.sql
```

## 🐛 Common Issues & Solutions

### "Port 8000 is already in use"

```bash
# Kill process di port 8000
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8000
kill -9 <PID>
```

### "SQLSTATE[HY000]: General error: 3 Error writing to file"

- Storage folder tidak writable
- Jalankan: `chmod -R 755 storage bootstrap/cache`

### "Class App\Models\... not found"

- Jalankan: `composer dump-autoload`

### "npm: command not found"

- Node.js tidak terinstall atau tidak di PATH
- Install dari: https://nodejs.org/

### "Missing PHP extension: gd/json/curl"

```bash
# Ubuntu/Debian
sudo apt install php8.2-gd php8.2-json php8.2-curl

# macOS (Homebrew)
brew install php && brew install php-gd
```

### Database table kosong

```bash
# Jalankan seeder (jika ada)
php artisan db:seed

# Atau manual migrations + seeders
php artisan migrate:fresh --seed
```

## 📦 Project Structure

```
limbahApp/
├── app/                      # PHP application code
│   ├── Http/Controllers/
│   ├── Models/
│   └── Providers/
├── resources/
│   ├── css/app.css          # Global Tailwind styles
│   ├── js/app.js            # Laravel entry (loads React)
│   ├── views/welcome.blade.php  # Main HTML shell
│   └── frontend/            # React application
│       ├── src/
│       │   ├── App.tsx      # Root component
│       │   ├── main.tsx     # React entry point
│       │   ├── components/  # React components
│       │   ├── context.tsx  # State management
│       │   ├── theme.ts     # Themes
│       │   └── i18n.ts      # Translations
│       ├── vite.config.ts   # Frontend build config
│       └── tsconfig.json    # TypeScript config
├── routes/web.php           # Web routes
├── public/
│   ├── build/               # Compiled assets (Vite output)
│   └── index.php            # Entry point
├── vite.config.js           # Main Vite config (Laravel + React)
├── package.json             # Node dependencies
├── composer.json            # PHP dependencies
├── .env.example             # Environment template
└── README.md                # Project readme
```

## 🔐 Security Notes untuk Development

1. **Jangan commit `.env`** - Sudah di `.gitignore`, gunakan `.env.example`
2. **Jangan share `APP_KEY`** - Generate unique key per environment
3. **DB Password** - Gunakan password yang kuat di production
4. **CORS** - Konfigurasi di `config/cors.php` untuk API

## 🚀 Next Steps

Setelah setup berhasil:

1. Baca [README.md](README.md) untuk overview project
2. Explore `resources/frontend/src/components/` untuk lihat React code
3. Buka `routes/web.php` untuk lihat routes
4. Check `app/Models/` untuk database models
5. Test dengan: `php artisan tinker`

## 📞 Butuh Bantuan?

Jika error atau stuck:

1. **Cek error message** - Baca dengan teliti pesan error
2. **Google error** - Paste error message ke Google
3. **Check documentation**:
   - Laravel: https://laravel.com/docs
   - React: https://react.dev
   - Vite: https://vitejs.dev
4. **Tanya team lead** - Jika sudah dicoba semua

---

**Happy Coding!** 🎉

