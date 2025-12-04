# Panduan Setup SSL untuk zeatextile.cloud

## Status saat ini:
✅ Private key sudah dibuat: `ssl/zeatextile.key`
✅ CSR sudah dibuat: `ssl/zeatextile.csr`
✅ File validasi domain sudah dibuat: `public/.well-known/pki-validation/9D2A8E69FB092CBE901DB1E9ED5997FE.txt`
⏳ Menunggu certificate dari Sectigo

## Langkah selanjutnya:

### 1. Deploy untuk verifikasi domain
Jalankan di VPS untuk deploy aplikasi dengan file validasi:

```bash
cd ~/project/ZeaTexReact
docker compose down
docker compose up -d --build
```

### 2. Verifikasi file validasi dapat diakses
Test dari browser atau curl:
```bash
curl http://zeatextile.cloud/.well-known/pki-validation/9D2A8E69FB092CBE901DB1E9ED5997FE.txt
```

Harus menampilkan:
```
40F9B9AF27285E7F47180891329405F6859D3C44FE6AFE631CFBB9FFDF69FD41
sectigo.com
t0915883001764864374
```

### 3. Submit CSR ke Sectigo
- Login ke panel Sectigo/provider SSL Anda
- Submit CSR dari file `ssl/zeatextile.csr`
- Tunggu proses verifikasi domain (biasanya beberapa menit sampai 24 jam)

### 4. Download certificate dari Sectigo
Setelah verifikasi selesai, Sectigo akan memberikan beberapa file:
- **Certificate** (zeatextile_cloud.crt atau domain.crt)
- **Intermediate Certificate** (CA Bundle)
- Mungkin juga **Root Certificate**

### 5. Gabungkan certificate (jika perlu)
Jika Sectigo memberikan certificate terpisah, gabungkan dalam urutan:
```bash
# Di komputer lokal atau VPS
cat domain.crt intermediate.crt > zeatextile.crt
```

Atau jika sudah bundled, langsung gunakan file certificate yang diberikan.

### 6. Replace placeholder certificate
Ganti isi file `ssl/zeatextile.crt` dengan certificate yang Anda terima dari Sectigo.

### 7. Rebuild dan deploy dengan HTTPS
```bash
cd ~/project/ZeaTexReact
docker compose down
docker compose up -d --build
```

### 8. Test HTTPS
```bash
# Test redirect HTTP ke HTTPS
curl -I http://zeatextile.cloud/

# Test HTTPS
curl -Ik https://zeatextile.cloud/
```

Buka di browser: https://zeatextile.cloud/

## Troubleshooting

### Jika muncul SSL error "certificate not found"
- Pastikan file `ssl/zeatextile.crt` sudah berisi certificate valid (bukan placeholder)
- Rebuild container: `docker compose up -d --build`

### Jika muncul "NET::ERR_CERT_AUTHORITY_INVALID"
- Certificate chain tidak lengkap
- Pastikan Anda sudah menggabungkan certificate dengan intermediate CA bundle

### Jika redirect tidak bekerja
- Clear browser cache
- Test dengan curl atau mode incognito

## File SSL yang dibutuhkan:
```
ssl/
├── zeatextile.key  ✅ (Private key - SUDAH ADA)
├── zeatextile.csr  ✅ (Certificate request - SUDAH ADA)
└── zeatextile.crt  ⏳ (Certificate - TUNGGU DARI SECTIGO)
```

## Keamanan
⚠️ **PENTING**: 
- File `zeatextile.key` adalah private key. JANGAN dibagikan ke siapapun.
- Jangan commit private key ke Git repository.
- Set permission yang ketat di VPS: `chmod 600 ssl/zeatextile.key`
