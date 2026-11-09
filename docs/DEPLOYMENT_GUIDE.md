# Panduan Penerapan & Operasional Produksi (Deployment Guide) - MONOWA

Panduan teknis langkah demi langkah untuk melakukan deploy aplikasi Monowa ke server produksi berbasis Linux (Ubuntu Server / Debian / CentOS) maupun Windows Server.

---

## 1. Prasyarat Server (Server Requirements)

- **Operating System**: Ubuntu 22.04 LTS / 24.04 LTS (Direkomendasikan) atau Windows Server 2022.
- **PHP**: Versi 8.2 atau 8.3 dengan ekstensi:
  - `php-fpm`, `php-mysql`, `php-mbstring`, `php-xml`, `php-curl`, `php-zip`, `php-bcmath`, `php-intl`, `php-gd`.
- **Database Server**: MySQL 8.0+ atau MariaDB 10.6+.
- **Node.js**: Versi 20 LTS atau 22 LTS (untuk proses kompilasi asset frontend Vite).
- **Web Server**: Nginx (direkomendasikan) atau Apache 2.4.
- **Composer**: Versi 2.6+.

---

## 2. Tahap Instalasi & Konfigurasi Awal

### 2.1 Clone Kode Sumber & Set Permissions
```bash
cd /var/www
git clone <repository-url> monowa
cd /var/www/monowa

# Berikan hak akses kepada user web server (www-data)
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### 2.2 Instalasi Dependensi Backend (PHP Composer)
```bash
composer install --no-dev --optimize-autoloader
```

### 2.3 Konfigurasi Environment File (`.env`)
Salin file template `.env.example` ke `.env`:
```bash
cp .env.example .env
php artisan key:generate
```

Sesuaikan parameter produksi pada `.env`:
```env
APP_NAME="Monowa - Waste Management"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://monowa.perusahaan.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=monowa_production
DB_USERNAME=monowa_user
DB_PASSWORD=PasswordKuatDatabase123!

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database
```

### 2.4 Migrasi Database & Seeder Master Data
```bash
php artisan migrate --force
php artisan db:seed --force
```

### 2.5 Hubungkan Penyimpanan File (Symlink Storage)
Agar foto bukti timbangan dapat diakses publik dengan aman:
```bash
php artisan storage:link
```

---

## 3. Kompilasi Aset Frontend (React + Vite)

Jalankan kompilasi aset statis agar frontend bekerja optimal dalam mode produksi tanpa perlu menyalakan Vite development server:
```bash
npm ci
npm run build
```
File hasil kompilasi akan otomatis ditempatkan di direktori `public/build/`.

---

## 4. Konfigurasi Web Server (Nginx)

Buat file konfigurasi server block pada `/etc/nginx/sites-available/monowa`:

```nginx
server {
    listen 80;
    server_name monowa.perusahaan.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name monowa.perusahaan.com;

    root /var/www/monowa/public;
    index index.php index.html;

    # SSL Certificates (Let's Encrypt atau Sertifikat Internal Perusahaan)
    ssl_certificate /etc/ssl/certs/monowa_ssl.crt;
    ssl_certificate_key /etc/ssl/private/monowa_ssl.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    charset utf-8;
    client_max_body_size 25M; # Mendukung upload foto timbangan beresolusi tinggi

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    # Cache untuk aset statis Vite
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

Aktifkan konfigurasi dan reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/monowa /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5. Konfigurasi Task Scheduler (Pengecekan Otomatis Masa Simpan B3)

Aplikasi Monowa memiliki perintah konsol `php artisan limbah:check-alerts` untuk mendeteksi limbah B3 yang memasuki H-30, H-7, atau telah EXPIRED.

Tambahkan cron job pada server:
```bash
sudo crontab -e -u www-data
```

Tambahkan baris berikut agar task scheduler Laravel berjalan setiap menit:
```cron
* * * * * cd /var/www/monowa && php artisan schedule:run >> /dev/null 2>&1
```

Atau jika ingin menjalankan pengecekan alert secara langsung setiap hari pada jam 06:00 pagi:
```cron
0 6 * * * cd /var/www/monowa && php artisan limbah:check-alerts >> /var/www/monowa/storage/logs/alerts.log 2>&1
```

---

## 6. Prosedur Backup & Maintenance

### Backup Database Harian Otomatis
```bash
mysqldump -u monowa_user -p'PasswordKuatDatabase123!' monowa_production | gzip > /backup/monowa_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Optimasi Cache Laravel untuk Produksi
Setiap kali melakukan pembaruan kode aplikasi, jalankan:
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```
