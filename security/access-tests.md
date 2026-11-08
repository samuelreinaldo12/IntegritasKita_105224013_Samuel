# Matriks Akses Peran & Uji Keamanan (sec-0.2)

## Status dan rujukan risiko Tugas 1

- **Penanda:** `sec-0.2`
- **RSK-01:** akses tanpa izin ke data laporan dan token.
- **RSK-02:** pemalsuan/penyalahgunaan akun admin.
- **RSK-05:** perubahan status tanpa jejak audit.
- **Status implementasi:** aplikasi saat ini adalah SPA dengan data contoh di memori browser. Tidak ada endpoint API/session, tabel akun, atau otorisasi server yang dapat diuji dengan akun. Form login admin lama memakai kredensial statis di bundle browser; pintasan itu telah dihapus dan panel admin kini gagal-tertutup kecuali sesi server menyatakan terautentikasi.
- **Batas penting:** pemeriksaan sesi dan penutupan panel di UI bukan pengganti otorisasi pada API. Jangan gunakan aplikasi ini dengan data nyata atau menyatakan kontrol server-side lulus sebelum backend tersedia.

## Matriks uji berpasangan

Lima skenario positif dipasangkan dengan lima skenario negatif. Skenario di bawah adalah rencana uji yang dapat direproduksi; selain hasil build lokal yang dicatat terpisah, tidak ada uji browser/API maupun akun yang dijalankan dalam lingkungan ini.

| No | Peran/akun uji | Target | Jenis | Hasil yang diharapkan | Hasil aktual | Status |
|---:|---|---|---|---|---|---|
| 1 | Tamu tanpa sesi | Form laporan | Positif | Tamu dapat membuka form publik dan mengirim data dummy valid | Belum diuji di browser; form menggunakan state lokal | BELUM DIUJI |
| 2 | Tamu tanpa sesi | Tab admin | Negatif | Panel admin tidak dirender; akses ditolak | Komponen UI sekarang menolak sesi non-authenticated; belum diuji di browser | PERLU VERIFIKASI |
| 3 | Tamu tanpa sesi | Pelacakan laporan dummy | Positif | Halaman pelacakan dapat dibuka tanpa membuka data pengguna nyata | Belum diuji di browser; data hanya mock lokal | BELUM DIUJI |
| 4 | Tamu tanpa sesi | `GET /api/session` | Negatif | Tanpa sesi, server mengembalikan 401 | Endpoint tidak ada | TERBLOKIR — backend belum ada |
| 5 | Administrator uji | Membuka panel admin | Positif | Sesi server valid dengan peran admin memberi akses | Tidak tersedia; tidak ada login/akun/server | TERBLOKIR — backend belum ada |
| 6 | Administrator uji | Membuka form publik | Positif | Admin tetap dapat membuka fungsi publik | Belum diuji; akun admin tidak tersedia | BELUM DIUJI |
| 7 | Administrator uji | `POST /api/masuk` dengan kredensial uji | Negatif | Kredensial salah ditolak tanpa membuat sesi | Endpoint tidak ada | TERBLOKIR — backend belum ada |
| 8 | Pengguna biasa uji | Membaca laporan admin | Negatif | Data admin ditolak dengan 403 | Tidak ada role pengguna atau endpoint laporan | TERBLOKIR — backend belum ada |
| 9 | Administrator uji | Mengubah status laporan dummy | Positif | Perubahan dilakukan oleh API setelah pemeriksaan role | Saat ini hanya state React lokal, bukan operasi server | TERBLOKIR — backend belum ada |
| 10 | Pengguna biasa uji | Mengubah status laporan | Negatif | API menolak dengan 403 dan tidak mengubah data | Tidak ada endpoint API status | TERBLOKIR — backend belum ada |

**Rekap:** 5 skenario positif dan 5 negatif. Belum ada hasil akses per peran yang dapat dinyatakan lulus; matriks ini bukan bukti otorisasi server.

## Penyimpanan kata sandi

Aplikasi belum memiliki akun atau penyimpanan kata sandi. Karena itu tidak ada hash kata sandi pengguna yang dapat diperiksa dan tidak ada data pengguna nyata yang dibaca. Bukti sintetis scrypt dapat dibuat dengan `node security/password-hash-demo.mjs`; bukti itu hanya mendemonstrasikan KDF dengan fixture uji, bukan integrasi autentikasi aplikasi. Sebelum menambah akun, backend wajib menyimpan hasil KDF bersalt (misalnya Argon2id atau scrypt dengan parameter terkalibrasi), bukan kata sandi mentah.

## Menutup kesenjangan autentikasi

Sebelum matriks dapat diuji ulang, implementasikan endpoint autentikasi server yang memverifikasi kata sandi ter-hash, mengeluarkan sesi aman, memeriksa peran pada setiap operasi admin, dan mencatat perubahan status. Tambahkan akun uji sintetis, lalu jalankan ulang semua pasangan positif/negatif dan ganti status di atas dengan output aktual.