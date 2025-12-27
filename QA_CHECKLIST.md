# QA Checklist (Android perangkat fisik / emulator)

Gunakan perangkat Android fisik atau emulator dan lakukan pengecekan manual berikut sebelum rilis.

## Persiapan Umum
- Pastikan build lokal terbaru terpasang di perangkat.
- Jalankan tes otomatis dasar: `npm test`.
- Pastikan koneksi internet stabil dan GPS diaktifkan (jika tersedia).

## Skenario Utama

### 1. Login & Autentikasi
- Login dengan kredensial valid berhasil membawa ke beranda.
- Kredensial salah menampilkan pesan error yang jelas.
- Sesi tetap aktif setelah aplikasi ditutup dan dibuka kembali.

### 2. Pemesanan (Order)
- Membuat order layanan baru hingga halaman pembayaran atau konfirmasi.
- Data order (alamat, jadwal, catatan) tersimpan dan muncul di riwayat.
- Pembatalan order mengembalikan status yang sesuai.

### 3. Chat
- Chat dengan mitra dapat dibuka dari detail order.
- Pesan terkirim dan diterima dengan benar.
- Notifikasi pesan baru muncul.
- Lampiran (jika ada) terkirim dengan benar.

### 4. Pembayaran
- Jalur pembayaran utama (metode prioritas) berhasil hingga status sukses.
- Gagal bayar menampilkan pesan error dan opsi coba lagi.

### 5. Notifikasi
- Notifikasi push atau in-app muncul untuk:
  - Update order
  - Chat
  - Pembayaran
- Menekan notifikasi membuka layar yang relevan.

### 6. GPS & Pelacakan
- Izin lokasi diminta dengan jelas dan dapat diaktifkan.
- Lokasi pelanggan muncul di fitur pelacakan atau penugasan mitra sesuai harapan.

---

**Catatan QA**
- Catat hasil tiap skenario (lulus / gagal).
- Sebutkan perangkat yang digunakan (fisik / emulator).
- Sertakan versi aplikasi.
- Lampirkan tangkapan layar jika ditemukan masalah.
