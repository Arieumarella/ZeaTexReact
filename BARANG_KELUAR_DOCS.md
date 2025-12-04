# Fitur Barang Keluar - Dokumentasi

## Ringkasan

Module **Barang Keluar** adalah sistem pengelolaan transaksi barang keluar (pengiriman ke customer) dengan dukungan pembayaran berjangka (cicilan). Fitur ini mencerminkan struktur dan fungsionalitas dari module **Barang Masuk** namun dengan adaptasi untuk customer daripada supplier.

## Struktur File

### Service Layer

**File:** `src/service/barangKeluarService.ts`

- `getAllCustomers()` - GET `/customer/all` - Mengambil daftar semua customer
- `getAllBarang()` - GET `/barang/all` - Mengambil daftar semua barang
- `getTransaksiKeluar(params)` - GET `/transaksi-keluar` - Mengambil daftar transaksi dengan filter & pagination
- `getTransaksiKeluarById(id)` - GET `/transaksi-keluar/:id` - Mengambil detail satu transaksi
- `createTransaksiKeluar(payload)` - POST `/transaksi-keluar` - Membuat transaksi baru
- `updateTransaksiKeluar(id, payload)` - PUT `/transaksi-keluar/:id` - Update transaksi
- `deleteTransaksiKeluar(id)` - DELETE `/transaksi-keluar/:id` - Hapus transaksi
- `updateBerjangkaKeluar(transaksiId, payload)` - PUT `/berjangka-keluar-cicil/:id` - Update pembayaran cicilan

### Pages

1. **BarangKeluar.tsx** - List transaksi barang keluar

   - Filter: Customer, Tanggal (awal-akhir)
   - Pagination: 10 data per halaman
   - Actions: Detail, Edit, Input Cicilan, Hapus
   - Export Excel
   - Status badge: ✓ Lunas (hijau) / Pembayaran Berjangka (merah)

2. **TambahKeluar.tsx** - Form tambah transaksi baru

   - Customer selection (autocomplete)
   - Barang selection (dynamic dropdown)
   - Multiple barang per transaksi
   - Discount & PPN (% atau Rp)
   - Payment type: Lunas atau Berjangka
   - Tenor selection (1-12 bulan)

3. **EditKeluar.tsx** - Form edit transaksi

   - Tenor validation: Tidak bisa kurang dari jumlah cicilan yang sudah dibayar
   - Read-only input untuk tenor yang sudah dibayar
   - Menampilkan jumlah pembayaran untuk tenor terbayar
   - Bisa menambah tenor baru

4. **DetailKeluar.tsx** - View detail transaksi

   - Informasi header: Tanggal, Customer, Penginput Data
   - Tabel detail barang
   - Discount & PPN
   - Status pembayaran dengan detail cicilan
   - Catatan
   - Kalkulasi total

5. **InputCicilanKeluar.tsx** - Input pembayaran cicilan
   - Table dengan kolom: No, Tanggal Jatuh Tempo, Jumlah Pembayaran
   - Number input untuk setiap tenor
   - Real-time total calculation
   - Submit untuk update pembayaran

## Backend Integration

### Endpoints Terintegrasi

```
POST   /transaksi-keluar              - Create
GET    /transaksi-keluar              - List with filters
GET    /transaksi-keluar/:id          - Get single
PUT    /transaksi-keluar/:id          - Update
DELETE /transaksi-keluar/:id          - Delete
PUT    /berjangka-keluar-cicil/:id    - Update payment installments
GET    /berjangka-keluar-cicil/:id    - Get installments
```

### Dropdown Support

```
GET    /customer/all                  - Customer list (updated from /pelanggan/all)
GET    /barang/all                    - Barang list
```

## Status Pembayaran

- **"0"** = Lunas (pembayaran langsung)
- **"1"** = Pembayaran Berjangka (cicilan)

## Routing

```
/barang-keluar              - List page
/tambah-keluar              - Add form
/edit-keluar/:id            - Edit form
/detail-keluar/:id          - Detail view
/input-cicilan-keluar/:id   - Payment input
```

## Fitur Utama

✅ CRUD operations
✅ Payment tracking dengan cicilan
✅ Filter & pagination
✅ Excel export
✅ Form validation
✅ Status badges
✅ Multiple barang per transaksi
✅ Discount & PPN calculation
✅ Dynamic tenor dates

## Testing Checklist

- [ ] Create new transaksi (lunas)
- [ ] Create new transaksi (berjangka with tenor)
- [ ] View list with filters
- [ ] Edit transaksi & tenor
- [ ] Input cicilan pembayaran
- [ ] View detail transaksi
- [ ] Delete transaksi
- [ ] Export Excel
- [ ] Test with actual backend data

## Notes

Semua file sudah terintegrasi dengan service layer dan siap untuk production testing dengan backend.
