# Threat Model (Analisis Ancaman STRIDE) - IntegritasKita

Analisis ancaman mendalam menggunakan metodologi **STRIDE** yang dipetakan secara spesifik terhadap elemen Diagram Aliran Data (DFD) dan aset terdampak.

| No | Kategori STRIDE | Elemen DFD Terdampak | Aset Terdampak | Deskripsi Ancaman Spesifik |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Spoofing** | U (Pelapor) -> F (ReportForm) | AST-02 | Penyerang mencoba memalsukan identitas token pelacakan untuk mengecoh sistem pelacakan status laporan. |
| **2** | **Spoofing** | Admin -> AD (AdminDashboard) | AST-08 | Penyerang melakukan *credential stuffing* atau pencurian sesi untuk menyamar sebagai verifikator sah di dasbor admin. |
| **3** | **Tampering** | F (ReportForm) -> C (Crypto Module) | AST-01 | Penyerang memodifikasi skrip JavaScript frontend di browser untuk menyisipkan *keylogger* yang mencuri input teks pelapor sebelum di-hash. |
| **4** | **Tampering** | C (Crypto Module) -> DS (Data Store) | AST-07 | Penyerang mencoba memanipulasi *ciphertext* atau *Initialization Vector* (IV) pada data cadangan laporan yang disimpan di penyimpanan lokal/server. |
| **5** | **Repudiation** | AD (AdminDashboard) -> LG (System Log) | AST-06 | Verifikator korup menyangkal bahwa mereka telah mengubah atau menolak status laporan pengaduan tertentu karena tidak adanya audit log yang ditandatangani. |
| **6** | **Repudiation** | U (Pelapor) -> F (ReportForm) | AST-01 | Pelapor menyangkal telah mengirimkan laporan palsu atau aduan provokatif karena tidak adanya mekanisme tanda tangan digital di sisi pelapor. |
| **7** | **Information Disclosure**| C (Crypto Module) -> DS (Data Store) | AST-05 | Kunci rahasia enkripsi admin (`AST-05`) terekspos secara tidak sengaja di dalam kode sumber frontend (*client-side bundle*) yang dapat diinspeksi publik. |
| **8** | **Information Disclosure**| DS (Secure Data Store) -> U (Public) | AST-01 | Pembacaan langsung terhadap isi laporan mentah oleh pihak luar akibat tidak aktifnya enkripsi AES-256-GCM pada penyimpanan data. |
| **9** | **Denial of Service** | F (ReportForm) -> C (Crypto Module) | AST-04 | Penyerang membanjiri modul hashing SHA-256 dengan permintaan data berukuran masif secara simultan (*HTTP Flood*) untuk melumpuhkan sumber daya browser/server. |
| **10** | **Elevation of Privilege**| Admin -> AD (AdminDashboard) | AST-08 | Pengguna umum memanipulasi parameter sesi atau *role* di browser untuk mendapatkan hak akses istimewa (*Admin Privilege*) dan menghapus data pengaduan. |