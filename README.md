# IntegritasKita - Platform Pengaduan Korupsi Anonim (v0.1)

Aplikasi web pengaduan dugaan korupsi secara anonim yang dikembangkan untuk memenuhi penugasan **Milestone 1 Pengembangan Aplikasi dan Web** serta **Tugas Kriptografi**.

---

## 1. Deskripsi Produk & Konsep Awal (Pemweb)
- **Nama Produk**: IntegritasKita
- **Permasalahan yang Diselesaikan**: Kekhawatiran pelapor terkait perlindungan privasi, kerahasiaan identitas, dan keamanan data saat melaporkan tindakan korupsi.
- **Sasaran Pengguna**: Masyarakat umum, *whistleblower*, serta tim verifikator/admin internal.
- **Fungsi Utama**: Menyediakan alur pengaduan anonim dengan jaminan kerahasiaan data menggunakan pustaka kriptografi standar modern di sisi klien serta dasbor pengawasan laporan.

---

## 2. Fitur Awal & Halaman Aplikasi
1. **Formulir Pengaduan Anonim**: Dilengkapi validasi sisi klien (*client-side validation*) untuk memastikan kelengkapan kategori, lokasi, kronologi minimal 20 karakter, serta unggah berkas bukti.
2. **Pelacakan Status Laporan (`TrackReport`)**: Memungkinkan pelapor memantau status pengaduan menggunakan kode token unik hash.
3. **Dasbor Pengawasan Admin (`AdminDashboard`)**: Antarmuka pengelolaan laporan hanya ditampilkan untuk sesi admin yang dinyatakan oleh server. Backend autentikasi/otorisasi belum tersedia, jadi panel dinonaktifkan dan aplikasi hanya menggunakan data mock; jangan gunakan untuk mengelola laporan nyata.
4. **Desain Responsif**: Antarmuka dioptimalkan untuk berbagai ukuran layar (Ponsel $\le$ 640 px, Tablet 768 px, dan Desktop $\ge$ 1024 px).
5. **Aksesibilitas Tinggi**: Menggunakan HTML semantik dan navigasi terstruktur (Skor Lighthouse Accessibility $\ge$ 85).
6. **Mock Data**: Menggunakan data tiruan terstruktur sebagai fondasi sebelum integrasi database di milestone berikutnya.

---

## 3. Analisis Kebutuhan Kriptografi
Sesuai ketentuan minimum keamanan data produk, tabel berikut memetakan kebutuhan perlindungan informasi:

| Nama Data / Elemen | Tujuan Keamanan (*Security Goal*) | Prioritas | Algoritma / Pustaka Kriptografi |
| :--- | :--- | :--- | :--- |
| **Identitas & Token Pelapor** | Anonimitas (*Anonymity*) | Tinggi | Hash SHA-256 (Web Crypto API) |
| **Isi Kronologi & Bukti** | Kerahasiaan (*Confidentiality*) | Tinggi | Primitive AES-256-GCM tersedia; belum terhubung ke penyimpanan data |
| **Validitas Token Laporan** | Integritas (*Integrity*) | Sedang | Hashing & Truncation Token |

*Catatan: Tidak ada sandi klasik yang digunakan untuk melindungi data produk; seluruhnya menggunakan pustaka standar industri (*Web Crypto API*) yang terpelihara.*

---

## 4. Rancangan Komponen Kriptografi
- **Masukan (*Input*)**: Teks UTF-8 (maksimal 1 MiB), AAD UTF-8 wajib (maksimal 1024 byte), serta kunci 256-bit yang diimpor dari hex.
- **Proses**: 
  1. Pembentukan *hash* SHA-256 dari timestamp dan deskripsi laporan untuk token pelacakan anonim.
  2. Primitive enkripsi teks AES-256-GCM dengan tag autentikasi 128-bit, AAD, dan IV acak 12-byte.
- **Keluaran (*Output*)**: `cipherTextHex` (ciphertext dan tag 128-bit di akhir), `ivHex` (12 byte), dan token hash SHA-256.
- **Representasi Data**: Input/AAD diubah menjadi UTF-8; ciphertext dan IV dikembalikan sebagai heksadesimal.
- **Sumber Keacakan**: IV memakai `crypto.getRandomValues()` dari Web Crypto API. Kunci 32-byte dibuat dengan CSPRNG saat provisioning dan disimpan di luar repository melalui secret manager/KMS.
- **Status integrasi**: Primitive diuji dengan data sintetis, tetapi aplikasi saat ini belum mengenkripsi laporan sebelum penyimpanan. Lihat [KEPUTUSAN.md](./KEPUTUSAN.md) untuk parameter, AAD, pengelolaan kunci, demonstrasi, dan batas implementasi.

---

## 5. Implementasi & Skenario Uji Otomatis (Unit Testing)
Modul kriptografi diimplementasikan pada `src/lib/crypto/cryptoService.ts` dan diuji menggunakan **Vitest** (`npm test`): hash SHA-256, round-trip AES-256-GCM, IV unik, ciphertext/tag yang diubah, kunci salah, AAD salah, input kunci/IV cacat, dan input kosong.

---

## 6. Teknologi yang Digunakan
- **Bahasa**: TypeScript, HTML5, CSS3
- **Framework UI**: React 18, Vite
- **Styling**: Tailwind CSS v4
- **Kriptografi**: Web Crypto API (Native Browser Substring Crypto)
- **Pengujian (Testing)**: Vitest

**Clone repository ini**:
   ```bash
   git clone [https://github.com/samuelreinaldo12/IntegritasKita_105224013_Samuel](https://github.com/samuelreinaldo12/IntegritasKita_105224013_Samuel)
   cd integritaskita