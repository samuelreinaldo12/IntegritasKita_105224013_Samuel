# Risk Register & Analisis Risiko - IntegritasKita

Dokumen ini merangkum penilaian tingkat kemungkinan (*Likelihood*) dan dampak (*Impact*) dari ancaman STRIDE, menetapkan 5 risiko prioritas utama, serta menyusun rencana mitigasi kontrol keamanan.

## 1. Analisis Risiko & 5 Risiko Prioritas

| ID Risiko | Threat Terkait | Kemungkinan (1-5) | Dampak (1-5) | Skor Risiko | Alasan Penilaian Berdasarkan Kondisi Produk | Status Prioritas |
| :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| **RSK-01** | Ancaman #7 (Info Disclosure Kunci Admin) | **4** | **5** | **20** | Kunci enkripsi simetris yang diletakkan sembarangan di frontend sangat rentan diekstrak, mengakibatkan seluruh kerahasiaan laporan pelapor bobol total. | **Prioritas 1 (Tinggi)**[cite: 13] |
| **RSK-02** | Ancaman #2 (Spoofing Akun Admin) | **3** | **5** | **15** | Portal admin saat ini menggunakan autentikasi sederhana tanpa MFA; jika kredensial admin bocor, penyerang dapat memanipulasi status seluruh kasus korupsi. | **Prioritas 2 (Tinggi)**[cite: 13] |
| **RSK-03** | Ancaman #3 (Tampering Frontend Script) | **3** | **4** | **12** | Aplikasi berjalan di lingkungan browser pelapor yang tidak dapat dikendalikan sepenuhnya, sehingga rentan terhadap injeksi skrip manipulatif. | **Prioritas 3 (Tinggi)**[cite: 13] |
| **RSK-04** | Ancaman #9 (DoS Modul Kriptografi) | **3** | **4** | **12** | Proses komputasi *hashing* dan enkripsi berulang di sisi klien dapat dieksploitasi untuk menghabiskan memori perangkat pengguna (*Client-side Resource Exhaustion*). | **Prioritas 4 (Tinggi)**[cite: 13] |
| **RSK-05** | Ancaman #5 (Repudiation Audit Log) | **4** | **3** | **12** | Ketiadaan sistem pencatatan audit berbasis tanda tangan kriptografi membuat aktivitas verifikator sulit dibuktikan secara hukum jika terjadi sengketa. | **Prioritas 5 (Tinggi)**[cite: 13] |

## 2. Rencana Kontrol Keamanan (Mitigasi Risiko)

| ID Risiko | Strategi Mitigasi / Kontrol Keamanan | Target Implementasi / Penugasan |
| :--- | :--- | :--- |
| **RSK-01** | Memindahkan penyimpanan kunci enkripsi sensitif dari kode sisi klien (*frontend*) ke layanan manajemen kunci aman di server terenkripsi (*Backend Key Vault*). | **Tugas 2 (Kontrol Akses & Backend Integration)**[cite: 13] |
| **RSK-02** | Menerapkan mekanisme autentikasi kuat berbasis token JWT terenkripsi dengan tambahan verifikasi Multi-Factor Authentication (MFA) untuk akun admin. | **Tugas 2 & Tugas 3**|
| **RSK-03** | Menerapkan kebijakan keamanan *Content Security Policy (CSP)* yang ketat dan integritas subresource pada header HTTP untuk mencegah eksekusi skrip asing. | **Tugas 3 (Secure Deployment & Hardening)**|
| **RSK-04** | Menambahkan mekanisme pembatasan tingkat permintaan (*Rate Limiting*) dan validasi ukuran masukan data maksimum sebelum diproses oleh fungsi kriptografi. | **Tugas 2 (Server-side Validation)** |
| **RSK-05** | Mengimplementasikan sistem pencatatan log audit terpusat yang dilindungi dengan *Cryptographic Hashing Chain* (Anti-Tamper Log). | **Tugas 3 (Auditing & Monitoring)**|