# Diagram Aliran Data (DFD) - IntegritasKita

Dokumen ini memuat rancangan arsitektur aliran data sistem pengaduan korupsi anonim, lengkap dengan batasan kepercayaan (*Trust Boundaries*) dan penandaan mekanisme kriptografi[cite: 12, 13]. Diagram menunjukkan rancangan target, bukan alur yang sudah terintegrasi pada aplikasi saat ini.

## 1. Trust Boundaries
- **TB-1 (Public Zone / Untrusted Zone)**: Zona luar tempat pengguna/pelapor mengakses antarmuka web melalui browser publik.
- **TB-2 (Application & Cryptographic Processing Zone)**: Zona eksekusi frontend lokal (React) dan modul Web Crypto API (Hashing SHA-256 & Enkripsi AES-256-GCM).
- **TB-3 (Admin & Secure Storage Zone)**: Zona terlindungi tempat verifikator mengakses dasbor admin dan penyimpanan data/backup terenkripsi.

## 2. Diagram Rancangan Target (Mermaid.js)

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

## Penandaan Mekanisme Kriptografi pada Rancangan Target

1. **Kripto-1: Hashing SHA-256 (Anonimitas Token)**
   - **Lokasi Aliran**: Dari `Crypto Module` menuju `TrackReport UI` / `Data Store`.
   - **Penjelasan**: Input kronologi + timestamp di-hash menggunakan SHA-256 untuk menghasilkan Token Pelacakan Anonim tanpa menyimpan identitas asli pelapor.

2. **Kripto-2: Enkripsi Simetris AES-256-GCM (Kerahasiaan Isi Laporan)**
   - **Lokasi Aliran**: Dari `Crypto Module` menuju `Data Store`.
   - **Penjelasan**: Rancangan menempatkan enkripsi sebelum penyimpanan menggunakan AES-256-GCM dengan 12-byte IV acak (`crypto.getRandomValues`), tag 128-bit, dan AAD kontekstual. Saat ini primitive AES tersedia di `src/lib/crypto/cryptoService.ts`, tetapi belum dihubungkan ke alur simpan laporan.

3. **Kripto-3: Dekripsi AES-256-GCM (Verifikasi Admin)**
   - **Lokasi Aliran**: Dari `Data Store` menuju `AdminDashboard UI`.
   - **Penjelasan**: Pada rancangan target, backend/verifikator yang terautentikasi mendekripsi *ciphertext* dengan kunci dari secret manager untuk membaca isi pengaduan. Backend, autentikasi, dan penyimpanan terenkripsi belum tersedia[cite: 12].

## Status implementasi

Aplikasi saat ini menggunakan data mock dan tidak menyimpan laporan terenkripsi. Diagram ini tidak membuktikan bahwa data nyata sudah dilindungi. Integrasi harus dilakukan di backend sebelum mengaktifkan penyimpanan data riil; kunci tidak boleh ditanam di frontend.