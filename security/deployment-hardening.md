# Prosedur hardening deployment (sec-0.2)

**Rujukan risiko Tugas 1:** RSK-01 (data/token), RSK-02 (akun admin), RSK-03 (integritas aplikasi), RSK-05 (audit). Prosedur ini menyiapkan konfigurasi; belum ada VM/container engine pada mesin pengembangan untuk menjalankannya.

## VM Linux: SSH dan Lynis

Target yang didukung skrip SSH adalah VM Ubuntu/Debian dengan systemd dan OpenSSH server. Jangan jalankan sampai login dengan kunci publik sudah diuji pada sesi SSH kedua; perubahan mematikan password authentication dan dapat mengunci akses jika kunci belum terpasang.

1. Salin kunci publik akun operator ke `authorized_keys` dan verifikasi login key-only di sesi SSH kedua.
2. Ambil baseline Lynis **sebelum** perubahan OS: `sudo lynis audit system --quick --no-colors | tee security/lynis-before.txt`.
3. Dari repository, jalankan `sudo bash security/harden-linux.sh` pada VM. Skrip memvalidasi konfigurasi sshd, memuat `security/sshd_config.d/00-sec-0.2.conf`, memeriksa konfigurasi efektif, lalu reload SSH.
4. Jalankan audit sesudahnya dengan `sudo lynis audit system --quick --no-colors | tee security/lynis-after.txt`, dan verifikasi hasil akhir menampilkan hardening index minimal 70. Simpan output asli dan catat temuan yang belum diperbaiki.
5. Periksa `sudo sshd -T | grep -E 'passwordauthentication|kbdinteractiveauthentication|permitrootlogin|pubkeyauthentication|authenticationmethods'`. Nilai wajib: password/kbd-interactive `no`, `permitrootlogin no`, public key `yes`, metode `publickey`.

Laporan saat ini **belum diambil**: mesin kerja adalah Windows, Lynis dan VM target tidak tersedia. File `lynis-before.txt` dan `lynis-after.txt` bukan bukti audit; jangan mengklaim skor sebelum laporan nyata disimpan.

## Container

`Dockerfile` membangun bundle Vite ke image nginx non-root. `compose.yaml` mengatur UID non-root, root filesystem read-only untuk app, `no-new-privileges`, penghapusan semua Linux capabilities, jaringan internal, serta tidak memetakan port host untuk app maupun database. Layanan frontend saat ini menggunakan data mock dan tidak terhubung ke database; layanan DB hanya disediakan untuk kebutuhan deployment berikutnya.

Jalankan `docker compose config`, lalu `docker compose up --build -d` pada host Docker uji dengan `POSTGRES_PASSWORD` yang dibuat di luar repository. Verifikasi identitas proses dengan `docker compose exec app id` dan `docker compose exec db id`; keduanya tidak boleh UID 0. `docker compose ps` tidak boleh menampilkan port yang dipublikasikan.

## Pemindaian image dan SBOM

Di host Linux dengan Docker dan Trivy, buat image baseline dari commit sebelum perubahan dan image sesudah hardening. Baseline repository sebelum pekerjaan ini adalah `7e9613d35b2c4f09a05368d2c9b69b55801dfe1d`; gunakan ID itu, bukan `HEAD` setelah perubahan di-commit. Jalankan dari root repository:

```bash
baseline_revision=7e9613d35b2c4f09a05368d2c9b69b55801dfe1d
baseline_dir="$(mktemp -d)"
trap 'rm -rf -- "$baseline_dir"' EXIT
git archive "$baseline_revision" | tar -x -C "$baseline_dir"
cp Dockerfile .dockerignore "$baseline_dir/"
docker build -t integritaskita-app:before "$baseline_dir"
docker build -t integritaskita-app:sec-0.2 .
bash security/scan-images.sh integritaskita-app:before integritaskita-app:sec-0.2
```

```powershell
.\security\scan-images.ps1 -ImageBefore <image-baseline> -ImageAfter integritaskita-app:sec-0.2
```

Skrip Bash dan PowerShell menyimpan output Trivy asli untuk kedua image, gagal jika pemindaian gagal atau image akhir memiliki kerentanan CRITICAL, dan menghasilkan `sbom.cdx.json` CycloneDX dari image akhir. Hasil pemindaian baru merupakan bukti setelah perintah ini benar-benar sukses dijalankan. Baseline sebelum perbaikan belum tersedia di mesin ini.

`security/generate-sbom.mjs` membuat CycloneDX dari dependency pada `package-lock.json` tanpa akses jaringan. Itu bukan inventaris paket OS di container; jalankan skrip Trivy untuk menggantinya dengan SBOM image akhir yang sebenarnya.
