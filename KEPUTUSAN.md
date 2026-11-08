# Keputusan Mekanisme Kriptografi

## Status dan cakupan

Modul `src/lib/crypto/cryptoService.ts` menyediakan primitive enkripsi teks AES-256-GCM yang diuji dengan data sintetis. Aplikasi saat ini masih berupa frontend dengan data mock: helper ini belum dipanggil oleh alur simpan/laporan, dan belum ada penyimpanan atau key management untuk data produk. Karena itu keputusan ini menjelaskan mekanisme yang disediakan, bukan klaim bahwa laporan yang dikirim saat ini sudah dienkripsi.

## Kebutuhan → mekanisme → alasan

| Kebutuhan | Mekanisme | Alasan |
|---|---|---|
| Menjaga kerahasiaan dan mendeteksi perubahan isi laporan | AES-256-GCM melalui Web Crypto API bawaan platform | AEAD mengenkripsi plaintext serta mengautentikasi ciphertext, nonce, dan AAD; tidak memerlukan pustaka kriptografi tambahan. |
| Mengautentikasi konteks laporan tanpa mengenkripsinya | AAD wajib, berupa konteks UTF-8 seperti `IntegritasKita:report:v1:<report-id>:description` | AAD terikat pada tag GCM, sehingga ciphertext tidak dapat dipindah diam-diam ke laporan/field lain. AAD tidak rahasia dan tidak boleh berisi identitas pribadi. |
| Mencegah nonce dipakai ulang pada enkripsi berbeda | IV acak 96-bit dari `crypto.getRandomValues()` untuk setiap enkripsi | 96-bit adalah ukuran nonce standar GCM. Pemanggil harus memakai IV baru untuk setiap operasi dengan kunci yang sama dan membatasi penggunaan kunci; jangan pernah menetapkan IV sendiri atau mengulang ciphertext lama dengan plaintext berbeda. |
| Menolak data yang tidak autentik atau input cacat | Verifikasi tag GCM 128-bit dan validasi ketat; dekripsi gagal tanpa mengembalikan plaintext | Perubahan ciphertext, tag, IV, AAD, atau penggunaan kunci salah membuat dekripsi ditolak. Tidak ada fallback ke plaintext. |

## Parameter dan format

- **Algoritma:** AES-GCM, Web Crypto API `crypto.subtle`.
- **Kunci:** tepat 256 bit / 32 byte; `importAES256Key` hanya menerima 64 karakter hex dan mengimpor sebagai `CryptoKey` non-extractable. Password atau frasa sandi tidak diterima sebagai kunci.
- **Pembuatan dan penyimpanan kunci:** hasilkan 32 byte dengan CSPRNG pada mesin provisioning tepercaya (contoh: `node security/generate-aes-key.mjs`), lalu masukkan langsung ke secret manager/KMS di luar repository. Jangan menaruh hasilnya di `.env` yang dicommit, bundle frontend, log, issue, atau riwayat shell. Rotasi dan backup kunci menjadi tanggung jawab pengelola secret.
- **IV:** 96 bit / 12 byte acak dari CSPRNG Web Crypto untuk setiap enkripsi. Simpan IV bersama ciphertext; IV tidak perlu dirahasiakan. IV tidak boleh dipakai kembali dengan kunci yang sama. Rotasi kunci bila jumlah enkripsi per kunci mendekati batas operasional GCM 2^32 operasi atau lebih awal sesuai kebijakan KMS.
- **AAD:** string UTF-8 wajib, bukan rahasia, maksimal 1024 byte. Gunakan konteks versi, ID record sintetis/non-PII, dan nama field yang stabil; berikan nilai AAD yang identik saat dekripsi.
- **Tag:** 128 bit / 16 byte. Web Crypto menggabungkan tag di akhir ciphertext keluaran; `cipherTextHex` menyimpan payload dan tag bersama-sama.
- **Batas input plaintext:** 1 MiB UTF-8 per operasi.
- **Keluaran:** `{ cipherTextHex, ivHex }`. Caller harus menyimpan nilai AAD dan identifier versi/kunci yang diperlukan untuk memilih kunci saat dekripsi.

## Penyediaan kunci uji di lingkungan aman

Skrip berikut hanya mengeluarkan kunci sintetis baru ke standard output; jalankan pada terminal tepercaya dan simpan hasil langsung ke secret manager, bukan ke file repository:

```bash
node security/generate-aes-key.mjs
```

Jangan jalankan generator untuk menampilkan kunci produksi dalam log/rekaman demonstrasi. Fixture pengujian dibuat acak per proses dan tidak merupakan data pengguna ataupun kunci produksi.

## Validasi dan uji

`npm test` mencakup SHA-256, round-trip AEAD, IV baru per enkripsi, penolakan ciphertext/tag yang dimodifikasi, kunci salah, AAD salah, format/panjang key dan IV salah, serta plaintext/AAD kosong. Dekripsi tidak menelan kegagalan autentikasi dan tidak mengembalikan plaintext bila verifikasi GCM gagal.

## Batas implementasi dan demonstrasi

1. Tunjukkan `KEPUTUSAN.md`, validasi impor kunci tepat 32 byte, dan IV 12 byte hasil CSPRNG.
2. Jalankan `npm test`; tunjukkan skenario round-trip berhasil dan uji ciphertext/tag/kunci/AAD yang dimodifikasi ditolak.
3. Tunjukkan generator hanya mengeluarkan kunci ke standard output; jangan menampilkan atau mengirim kunci sungguhan.
4. Jelaskan bahwa aplikasi belum menghubungkan helper ke penyimpanan laporan. Sebelum memakai data nyata, integrasikan enkripsi pada boundary backend sebelum data disimpan dan gunakan KMS/secret manager; menyimpan kunci di frontend akan membocorkannya kepada pengguna browser.
