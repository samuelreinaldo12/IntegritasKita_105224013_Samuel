# AI Usage Log - IntegritasKita

- **Tanggal**: 13 Oktober 2026
- **Model AI**: Gemini
- **Tujuan Penggunaan**: 
  - Membantu merancang dan mengoptimalkan antarmuka komponen React + TypeScript + Tailwind CSS v4.
  - Membantu menyusun modul kriptografi Web Crypto API (`SHA-256` & `AES-256-GCM`) dan unit test otomatis Vitest.
  - Membantu merefaktorisasi file dokumentasi `README.md` sesuai rubrik penilaian tugas.
- **Ringkasan Perintah / Prompt Utama**:
  - *"Buatkan modul kriptografi SHA-256 dan AES-256-GCM menggunakan Web Crypto API beserta 4 unit test Vitest."*
  - *"Bantu sesuaikan antarmuka dan validasi formulir agar responsif serta memenuhi standar aksesibilitas Lighthouse."*
  - *"Sesuaikan isi README.md menggabungkan ketentuan Pemweb Milestone 1 dan Kriptografi."*
- **Bagian yang Dipakai / Diubah**:
  - `src/lib/crypto/cryptoService.ts` & `cryptoService.test.ts`
  - `src/pages/ReportForm.tsx`, `TrackReport.tsx`, `AdminDashboard.tsx`
  - `README.md`
- **Cara Memeriksa & Memvalidasi Kode**:
  - Menjalankan uji otomatis `npm run test` untuk memastikan 4 unit test kriptografi lulus (`4 passed`).
  - Menjalankan server lokal `npm run dev` untuk menguji fungsionalitas UI, validasi form, dan responsivitas layout.
  - Menjalankan pengujian Lighthouse Accessibility di browser Chrome.
- **Pernyataan Integritas**:
  - Seluruh kode yang dihasilkan telah diperiksa, dipahami, dan diuji secara mandiri.
  - Tidak ada kunci privat, token, password, secrets, atau data pribadi yang disertakan di dalam repository (seluruh data bersifat sintetis).

- **Pengerjaan Sesi Cybersecurity**:
  - Membantu menyusun inventaris aset produk beserta rating CIA dan alasannya di `security/asset-inventory.md`.
  - Merancang diagram aliran data (DFD), trust boundaries, dan penanda kripto di `security/dfd.md`.
  - Menulis 10 analisis ancaman STRIDE spesifik di `security/threat-model.md`.
  - Menyusun risk register, 5 risiko prioritas dengan analisis kondisi produk, dan rencana kontrol di `security/risk-register.md`.