# Troubleshooting Guide - Limbah App

Panduan untuk mengatasi common issues dan error saat development.

## 🎯 Checklist Awal

Sebelum troubleshoot, pastikan:

- [ ] `npm run dev` berjalan di Terminal 1
- [ ] `php artisan serve` berjalan di Terminal 2
- [ ] Database sudah create dan migrate
- [ ] `.env` sudah dikonfigurasi
- [ ] Browser mengakses `http://localhost:8000`

## ❌ Layar Blank / White Screen

### Penyebab Umum

1. **Vite dev server belum running**
2. **React tidak ter-mount ke DOM**
3. **Browser cache / old assets**
4. **Database connection error**
5. **JavaScript error di browser console**

### Solusi Step-by-Step

#### 1. Cek Terminal 1 (Vite)

```bash
npm run dev
```

Harus lihat output seperti:
```
VITE v8.1.5  ready in XXX ms
➜  Local:   http://localhost:5173/
➜  press h to show help
```

**Jika error:**
```bash
# Clear node_modules dan reinstall
rm -rf node_modules package-lock.yaml
npm install

# Jalankan lagi
npm run dev
```

#### 2. Cek Terminal 2 (Laravel)

```bash
php artisan serve
```

Harus lihat output seperti:
```
Laravel development server started: http://127.0.0.1:8000
```

**Jika port already in use:**
```bash
# Gunakan port lain
php artisan serve --port=8001
```

**Jika PHP error:**
```bash
# Check PHP installation
php --version

# Check extensions
php -m | grep -E 'pdo|mysql|curl'
```

#### 3. Buka Browser Console (F12)

Tekan **F12** atau **Ctrl+Shift+I**:

- Buka tab **Console**
- Cari pesan error merah/kuning
- Screenshot dan kirim ke team jika perlu

**Common errors:**

```
Failed to fetch module script
→ Vite server tidak running

Uncaught TypeError: Cannot read property 'getElementById'
→ React mount point #app tidak ada atau salah nama

CORS policy
→ API call issue
```

#### 4. Clear Cache Browser

**Chrome:**
1. Tekan **Ctrl+Shift+Delete**
2. Pilih "All time"
3. Centang "Cookies and other site data"
4. Click "Clear data"
5. Refresh: **Ctrl+F5**

**Firefox:**
1. Tekan **Ctrl+Shift+Delete**
2. Pilih "Everything"
3. Click "Clear Now"
4. Refresh: **Ctrl+Shift+R**

#### 5. Clear Laravel Cache

```bash
# Buka terminal ketiga
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# Jika masih tidak work
php artisan optimize:clear
```

#### 6. Rebuild Assets

```bash
# Tekan Ctrl+C di Terminal 1 (Vite)

# Production build
npm run build

# Jalankan dev server lagi
npm run dev
```

#### 7. Check Database Connection

```bash
# Terminal baru - Buka Laravel REPL
php artisan tinker

# Test database connection
>>> DB::connection()->getPdo()
```

Jika error:
```bash
# Cek .env database config
# Pastikan database sudah ada dan accessible

# Test dari command line
mysql -u root -p -e "USE limbah_app; SHOW TABLES;"
```

---

## 🔴 Error: "Address already in use"

**Penyebab:** Port sudah digunakan process lain

### Solusi

**Windows:**
```bash
# Cari process di port 8000
netstat -ano | findstr :8000

# Output: TCP    127.0.0.1:8000    0.0.0.0:0    LISTENING    1234

# Kill process (ganti 1234 dengan PID)
taskkill /PID 1234 /F
```

**macOS/Linux:**
```bash
# Cari process
lsof -i :8000

# Output: COMMAND   PID  USER   FD  TYPE   DEVICE SIZE/OFF NODE NAME
#         php     12345 user   6u  IPv4 0x1234a 0t0  TCP *:8000

# Kill process (ganti 12345 dengan PID)
kill -9 12345
```

**Alternatif:** Gunakan port berbeda
```bash
php artisan serve --port=8001
```

---

## 🔴 Error: "Class not found" atau "Undefined variable"

**Penyebab:** Autoloader tidak updated

### Solusi

```bash
# Dump autoloader
composer dump-autoload

# Atau optimize
composer dump-autoload -o
```

---

## 🔴 Error: "SQLSTATE[HY000]: General error: 3"

**Penyebab:** Storage folder tidak writable

### Solusi

**Windows:**
```bash
# Right-click folder storage → Properties → Security
# Berikan full permissions untuk user
```

**macOS/Linux:**
```bash
chmod -R 755 storage bootstrap/cache
```

---

## 🔴 Error: "MySQL connection refused"

**Penyebab:** MySQL tidak running atau credential salah

### Solusi

1. **Cek MySQL running:**
   ```bash
   # Windows
   mysql -u root -p
   
   # macOS
   brew services list | grep mysql
   
   # Linux
   sudo systemctl status mysql
   ```

2. **Jika tidak running:**
   ```bash
   # Windows - Start MySQL
   "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld"
   
   # macOS
   brew services start mysql
   
   # Linux
   sudo systemctl start mysql
   ```

3. **Cek `.env` database config:**
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=limbah_app
   DB_USERNAME=root
   DB_PASSWORD=
   ```

4. **Test connection manual:**
   ```bash
   mysql -u root -p -h 127.0.0.1 -D limbah_app
   ```

---

## 🔴 Error: "npm: command not found"

**Penyebab:** Node.js tidak installed atau tidak di PATH

### Solusi

1. **Install Node.js:** https://nodejs.org/
2. **Verify installation:**
   ```bash
   node --version
   npm --version
   ```
3. **Add to PATH (jika needed):**
   - Windows: Node.js installer biasanya handle ini
   - macOS/Linux: `which node` harus return path

---

## 🔴 Error: "PHP extension ... not found"

**Penyebab:** Extension PHP belum diinstall

### Solusi

**Windows (Laragon):**
- Buka Laragon → Tools → PHP → Extensions
- Enable extension yang diperlukan (gd, curl, pdo_mysql, json)

**Ubuntu/Debian:**
```bash
sudo apt install php8.2-{gd,curl,pdo-mysql,json,bcmath,mbstring,xml}
```

**macOS:**
```bash
brew install php@8.2
```

---

## 🔴 Build Error: "Unexpected JSX expression"

**Penyebab:** File `.js` menggunakan JSX

### Solusi

- Ubah nama file dari `.js` ke `.jsx`
- Atau gunakan `createElement()` instead of JSX

---

## 🔴 Error: "Module not found: recharts"

**Penyebab:** Dependency tidak terinstall

### Solusi

```bash
npm install
npm install recharts
npm run build
```

---

## 🔴 Vite Warning: "Some chunks are larger than 500 kB"

**Penyebab:** Bundle size terlalu besar (warning only, tidak block)

### Solusi (Opsional)

Jika ingin optimize:
```bash
# Edit vite.config.js
build: {
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('node_modules/recharts')) {
          return 'recharts'
        }
      }
    }
  }
}
```

---

## 🔴 Git Commit Error: ".env is untracked"

**Penyebab:** .env ada di git (seharusnya tidak)

### Solusi

```bash
# Remove .env dari git tracking (future commits only)
git rm --cached .env

# Verify .gitignore has .env
cat .gitignore | grep .env

# Add back .gitignore
git add .gitignore
git commit -m "Remove .env from tracking"
```

---

## ✅ Testing Setup

Untuk verify semua working:

```bash
# Test backend
php artisan tinker
>>> DB::table('users')->count()  # Should return integer or 0

# Test frontend in console
>>> axios.get('/api/health')  # Should work (jika API ada)
```

---

## 📊 Performance Troubleshooting

**Jika aplikasi lambat:**

```bash
# Clear cache
php artisan optimize:clear

# Rebuild assets
npm run build

# Check log files
tail -f storage/logs/laravel.log
```

---

## 🎯 Checklist untuk Debug

Jika masih error, cek checklist ini:

- [ ] PHP 8.2+ installed? (`php --version`)
- [ ] Composer working? (`composer --version`)
- [ ] Node.js 18+ installed? (`node --version`)
- [ ] npm working? (`npm --version`)
- [ ] MySQL running? (`mysql -u root`)
- [ ] Database created? (`SHOW DATABASES;`)
- [ ] `.env` file exists?
- [ ] `php artisan key:generate` run?
- [ ] `composer install` completed?
- [ ] `npm install` completed?
- [ ] `php artisan migrate` completed?
- [ ] `npm run dev` running?
- [ ] `php artisan serve` running?
- [ ] Browser console (F12) clear of errors?
- [ ] Network tab (F12) showing requests?

---

## 📞 Masih Stuck?

1. **Screenshot error dan console**
2. **Paste output dari terminal**
3. **Describe langkah yang sudah dicoba**
4. **Tanya ke team lead dengan detail**

**Helpful info untuk ask help:**
```
- OS: Windows 10 / macOS / Linux
- PHP version: (php --version)
- Node version: (node --version)
- Error message: (copy-paste exact error)
- Terminal output: (screenshot)
- .env config: (DB_* values)
- Browser console: (F12 → Console)
```

---

**Last Updated**: 2026-07-24

