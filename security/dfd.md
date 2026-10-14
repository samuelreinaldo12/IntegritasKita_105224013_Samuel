# Diagram Aliran Data (DFD) - IntegritasKita

Dokumen ini memuat diagram arsitektur aliran data sistem pengaduan korupsi anonim, lengkap dengan batasan kepercayaan (*Trust Boundaries*) dan penandaan mekanisme kriptografi[cite: 12, 13].

## 1. Trust Boundaries
- **TB-1 (Public Zone / Untrusted Zone)**: Zona luar tempat pengguna/pelapor mengakses antarmuka web melalui browser publik.
- **TB-2 (Application & Cryptographic Processing Zone)**: Zona eksekusi frontend lokal (React) dan modul Web Crypto API (Hashing SHA-256 & Enkripsi AES-256-GCM).
- **TB-3 (Admin & Secure Storage Zone)**: Zona terlindungi tempat verifikator mengakses dasbor admin dan penyimpanan data/backup terenkripsi.

## 2. Diagram Aliran Data (Mermaid.js)

```mermaid
graph TD
    subgraph TB-1 [Trust Boundary 1: Public Zone]
        U[Pelapor / Whistleblower]
    end

    subgraph TB-2 [Trust Boundary 2: Client App & Crypto Zone]
        F[1. ReportForm UI]
        C[2. Crypto Module <br/>- SHA-256 Hashing <br/>- AES-256-GCM]
        TR[3. TrackReport UI]
    end

    subgraph TB-3 [Trust Boundary 3: Admin & Storage Zone]
        AD[4. AdminDashboard UI]
        DS[(5. Secure Data Store <br/>& Backup)]
        LG[6. System Audit Log]
    end

    %% Aliran Data Utama
    U -->|Input Data Laporan & Berkas| F
    F -->|Kirim Plaintext & File| C
    C -->|Generate Hash Token (SHA-256)| TR
    C -->|Enkripsi Ciphertext (AES-256-GCM)| DS
    
    U -->|Masukkan Token Pelacakan| TR
    TR -->|Query Status Laporan| DS

    Admin[Verifikator / Admin] -->|Login Kredensial| AD
    AD -->|Dekripsi Data (AES-Decrypt)| DS
    AD -->|Update Status / Verifikasi| DS
    DS -->|Catat Aktivitas Audit| LG

## Penandaan Mekanisme Kriptografi pada Aliran Data

1. **Kripto-1: Hashing SHA-256 (Anonimitas Token)**
   - **Lokasi Aliran**: Dari `Crypto Module` menuju `TrackReport UI` / `Data Store`.
   - **Penjelasan**: Input kronologi + timestamp di-hash menggunakan SHA-256 untuk menghasilkan Token Pelacakan Anonim tanpa menyimpan identitas asli pelapor.

2. **Kripto-2: Enkripsi Simetris AES-256-GCM (Kerahasiaan Isi Laporan)**
   - **Lokasi Aliran**: Dari `Crypto Module` menuju `Data Store`.
   - **Penjelasan**: Teks laporan dan berkas bukti dienkripsi menggunakan AES-256-GCM dengan 12-byte IV acak (`crypto.getRandomValues`) sebelum disimpan ke penyimpanan data.

3. **Kripto-3: Dekripsi AES-256-GCM (Verifikasi Admin)**
   - **Lokasi Aliran**: Dari `Data Store` menuju `AdminDashboard UI`.
   - **Penjelasan**: Verifikator yang terautentikasi melakukan dekripsi *ciphertext* menggunakan kunci rahasia admin untuk membaca isi pengaduan asli[cite: 12].