Panduan pengaturan HTTPS (Traefik + Let's Encrypt)

Ringkasan:
- Kita menambahkan Traefik sebagai reverse-proxy yang otomatis mendapatkan sertifikat Let's Encrypt.
- Traefik membutuhkan port 80 dan 443 terbuka dan DNS domain mengarah ke IP VPS.
- Anda perlu mengganti alamat email ACME di `docker-compose.yml` dan memberikan izin file `acme.json`.

Langkah-langkah:

1) Periksa DNS
- Pastikan `zeatextile.cloud` memiliki A record yang mengarah ke IP VPS Anda.
- Anda bisa periksa dari mesin lokal atau VPS:

  PowerShell (lokal):
  nslookup zeatextile.cloud

  Linux (di VPS):
  dig +short zeatextile.cloud

2) Pastikan port 80 dan 443 terbuka pada VPS (firewall / provider)
- Contoh membuka port pada Ubuntu (UFW):

  sudo ufw allow 80/tcp; sudo ufw allow 443/tcp; sudo ufw reload

- Jika pakai iptables atau control panel Hostinger, buka port 80 dan 443.

3) Set email ACME di `docker-compose.yml`
- Buka `docker-compose.yml` dan ubah baris:
  `--certificatesresolvers.myresolver.acme.email=youremail@example.com`
  menjadi email Anda yang aktif (digunakan Let's Encrypt untuk notifikasi).

4) Siapkan file `acme.json` dan izinnya (harus di VPS)
- Di direktori project (tempat `docker-compose.yml`) sudah ada folder `letsencrypt/acme.json`.
- Pada VPS, set izin agar Traefik dapat menulis, dan file aman:

  cd /path/to/project
  touch letsencrypt/acme.json; sudo chmod 600 letsencrypt/acme.json

  (Jika file sudah ada, cukup jalankan `sudo chmod 600 letsencrypt/acme.json`)

5) Jalankan Docker Compose
- Dari direktori project di VPS, jalankan:

  docker-compose up -d

  atau jika menggunakan Docker Compose V2 (alias `docker compose`):

  docker compose up -d

6) Cek status dan logs
- Periksa container Traefik:

  docker ps | grep traefik
  docker logs -f traefik

- Jika sertifikat berhasil diperoleh, Traefik akan menulis ke `letsencrypt/acme.json` dan Anda akan melihat pesan sukses pada log.

7) Verifikasi di browser
- Buka https://zeatextile.cloud/ — harusnya sekarang menggunakan HTTPS.

Catatan dan troubleshooting singkat:
- Jika Traefik tidak bisa mendapatkan sertifikat: periksa log Traefik untuk error ACME (mis. DNS belum benar, port 80 ditangkap service lain, atau firewall memblokir).
- Jika Hostinger juga punya layanan SSL di panel, pastikan tidak ada konflik; idealnya biarkan Traefik langsung yang mengelola sertifikat (atau nonaktifkan SSL provider Hostinger untuk domain tersebut).
- Jika VPS memakai IPv6, pastikan DNS AAAA juga cocok atau gunakan hanya IPv4.

Butuh bantuan lebih lanjut?
- Jika Anda mau, saya bisa: (a) mengganti `youremail@example.com` di `docker-compose.yml` ke email Anda, (b) membantu membuat perintah yang tepat untuk environment VPS Anda, atau (c) memeriksa log Traefik setelah Anda menjalankan `docker-compose up -d`.
