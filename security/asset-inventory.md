# Inventaris Aset - IntegritasKita

Dokumen ini mencatat inventaris aset produk, tingkat kepentingan keamanan (*Confidentiality, Integrity, Availability* / CIA), beserta alasannya berdasarkan karakteristik sistem pengaduan korupsi anonim.

## Tabel Inventaris Aset

| ID Aset | Nama Aset / Komponen | Jenis Aset | C | I | A | Alasan Penilaian CIA |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AST-01** | Data Laporan Pengaduan (Deskripsi & Bukti) | Data | **Tinggi** | **Tinggi** | **Sedang** | Kerahasiaan wajib dijaga mutlak karena menyangkut privasi pelapor korupsi; integritas penting agar isi laporan tidak diubah pihak luar; ketersediaan penting untuk investigasi. |
| **AST-02** | Token Pelacakan Anonim (SHA-256 Hash) | Data / Secrets | **Tinggi** | **Tinggi** | **Rendah** | Token berbasis hash digunakan pelapor untuk melacak status tanpa membongkar identitas asli; integritas hash mencegah pemalsuan token. |
| **AST-03** | Frontend Web App (React + TypeScript + Tailwind) | Layanan | **Rendah** | **Tinggi** | **Tinggi** | Kode antarmuka harus utuh tanpa injeksi skrip berbahaya (integritas) dan selalu dapat diakses oleh masyarakat (ketersediaan). |
| **AST-04** | Modul Kriptografi Sisi Klien (Web Crypto API) | Layanan | **Tinggi** | **Tinggi** | **Tinggi** | Bertanggung jawab atas hashing SHA-256 dan enkripsi AES-256-GCM; kegagalan modul mengancam kerahasiaan dan integritas data seluruh sistem. |
| **AST-05** | Kunci Rahasia Admin / Verifikator (Secret Key) | Secrets | **Tinggi** | **Tinggi** | **Rendah** | Kunci enkripsi simetris AES-256-GCM; jika bocor, seluruh isi laporan terenkripsi dapat dibaca oleh pihak yang tidak berwenang. |
| **AST-06** | Berkas Log Aktivitas Sistem & Transaksi | Log | **Sedang** | **Tinggi** | **Sedang** | Log jejak akses dan verifikasi admin diperlukan untuk audit integritas penanganan kasus korupsi. |
| **AST-07** | Data Cadangan (*Backup*) Laporan | Backup | **Tinggi** | **Tinggi** | **Tinggi** | Menyimpan salinan arsip pengaduan; kerahasiaan dan ketersediaannya kritikal untuk keberlangsungan investigasi jangka panjang. |
| **AST-08** | Kredensial Akun Admin / Verifikator | Akun Admin | **Tinggi** | **Tinggi** | **Rendah** | Mengontrol akses masuk ke dasbor pengawasan; kompromi pada akun ini memberi akses penuh untuk mengubah status laporan. |