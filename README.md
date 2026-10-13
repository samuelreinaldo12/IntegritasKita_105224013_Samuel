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
3. **Dasbor Pengawasan Admin (`AdminDashboard`)**: Portal manajemen bagi verifikator untuk meninjau dan memperbarui status laporan (*Menunggu Verifikasi*, *Sedang Investigasi*, *Selesai*, *Ditolak*).
4. **Desain Responsif**: Antarmuka dioptimalkan untuk berbagai ukuran layar (Ponsel $\le$ 640 px, Tablet 768 px, dan Desktop $\ge$ 1024 px).
5. **Aksesibilitas Tinggi**: Menggunakan HTML semantik dan navigasi terstruktur (Skor Lighthouse Accessibility $\ge$ 85).
6. **Mock Data**: Menggunakan data tiruan terstruktur sebagai fondasi sebelum integrasi database di milestone berikutnya.

---

## 3. Analisis Kebutuhan Kriptografi
Sesuai ketentuan minimum keamanan data produk, tabel berikut memetakan kebutuhan perlindungan informasi:

| Nama Data / Elemen | Tujuan Keamanan (*Security Goal*) | Prioritas | Algoritma / Pustaka Kriptografi |
| :--- | :--- | :--- | :--- |
| **Identitas & Token Pelapor** | Anonimitas (*Anonymity*) | Tinggi | Hash SHA-256 (Web Crypto API) |
| **Isi Kronologi & Bukti** | Kerahasiaan (*Confidentiality*) | Tinggi | Enkripsi Simetris AES-256-GCM |
| **Validitas Token Laporan** | Integritas (*Integrity*) | Sedang | Hashing & Truncation Token |

*Catatan: Tidak ada sandi klasik yang digunakan untuk melindungi data produk; seluruhnya menggunakan pustaka standar industri (*Web Crypto API*) yang terpelihara.*

---

## 4. Rancangan Komponen Kriptografi
- **Masukan (*Input*)**: Teks laporan mentah, berkas bukti pendukung, dan kunci rahasia admin.
- **Proses**: 
  1. Pembentukan *hash* SHA-256 dari timestamp dan deskripsi laporan untuk token pelacakan anonim.
  2. Enkripsi simetris menggunakan algoritma AES-256-GCM pada data teks laporan.
- **Keluaran (*Output*)**: Nilai *Ciphertext* (Hex), *Initialization Vector* (Hex), dan *Token Hash* (Hex).
- **Representasi Data**: Format data dikodekan dalam bentuk Heksadesimal (*Hex*) berbasis `UTF-8`.
- **Sumber Keacakan**: Menggunakan `crypto.getRandomValues()` sebagai *CSPRNG* (*Cryptographically Secure Pseudo-Random Number Generator*) bawaan browser yang aman untuk membangkitkan IV 12-byte.

---

## 5. Implementasi & Skenario Uji Otomatis (Unit Testing)
Modul kriptografi diimplementasikan pada `src/lib/crypto/cryptoService.ts` dan diuji menggunakan **Vitest** (`npm run test`) dengan total 4 skenario uji otomatis:
- ✅ **Uji Positif 1**: Hashing SHA-256 menghasilkan string heksadesimal tepat 64 karakter.
- ✅ **Uji Positif 2**: Enkripsi dan dekripsi AES-256-GCM berhasil mengembalikan teks asli secara utuh.
- ✅ **Uji Positif 3**: Pembangkitan *random IV* menghasilkan *ciphertext* unik meskipun teks masukan sama.
- ❌ **Uji Batas/Negatif**: Memastikan fungsi hashing melempar *error* (*throw error*) saat menerima masukan teks kosong.

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