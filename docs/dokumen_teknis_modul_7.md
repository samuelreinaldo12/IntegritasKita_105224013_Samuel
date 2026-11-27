# Dokumen Teknis Modul 7 — Debugging dan Telaah Kode

- **Nama/NIM**: Samuel Reinaldo Sebastian Sianturi / 105224013
- **Repositori**: https://github.com/samuelreinaldo12/integritaskita
- **Pull request**: https://github.com/samuelreinaldo12/IntegritasKita_105224013_Samuel/pull/1

---

## 1. Lingkungan dan Konfigurasi Debugger

- **Lingkungan Pengujian**:
  - **Runtime**: Node.js 24 LTS
  - **Framework & Pustaka**: Next.js 16.x (App Router), Prisma ORM 7.x (`@prisma/adapter-pg`), Zod 4
  - **Basis Data**: PostgreSQL 18 (data sintetis hasil `npx prisma db seed`)
  - **Peramban & Editor**: Google Chrome + React Developer Tools, Visual Studio Code
  - **Branch & Hash Commit Awal**: Branch `praktikum/modul-07` dibuat dari `main` (`[isi-hash-commit-awal-dari-git-log]`), melanjutkan basis kode `integritaskita` Milestone 2 (`v0.2`).

### Konfigurasi `.vscode/launch.json`
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev -- --inspect"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    },
    {
      "name": "Next.js: debug full stack",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/next/dist/bin/next",
      "runtimeArgs": ["--inspect"],
      "skipFiles": ["<node_internals>/**"],
      "serverReadyAction": {
        "action": "debugWithChrome",
        "killOnServerStop": true,
        "pattern": "- Local:.+(https?://.+)",
        "uriFormat": "%s",
        "webRoot": "${workspaceFolder}"
      }
    }
  ]
}
```

### Konfigurasi Log Query Prisma (`lib/prisma.ts`)
```ts
import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const g = globalThis as unknown as { prisma?: PrismaClient };
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

export const prisma =
  g.prisma ??
  new PrismaClient({
    adapter,
    log: ["query", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") g.prisma = prisma;
```

### Bukti Debugger Berhenti di Server Component
- Breakpoint dipasang pada baris query Prisma di `app/katalog/page.tsx` menggunakan konfigurasi `"Next.js: debug server-side"`. Saat `http://localhost:3000/katalog` diakses, eksekusi berhenti di baris tersebut, panel **Variables** serta **Call Stack** terbaca, dan terminal mencetak log `prisma:query SELECT ...`.
- **Tangkapan Layar**:
  `![Debugger berhenti di Server Component](../screenshots/modul-07/01-debugger-server.png)`

---

## 2. Daftar Galat

| No | Issue | Gejala | Lapisan | Akar penyebab | Commit perbaikan |
|---|---|---|---|---|---|
| 1 | `#11` | Status `"Tidak tersedia"` tidak tersimpan meski formulir berhasil dikirim | Server / Validasi (`lib/skema.ts` & Server Action) | `z.coerce.boolean()` memanggil `Boolean("false")` yang mengevaluasi string tidak kosong menjadi `true` | `[hash-commit-fix-1]` |
| 2 | `#12` | Setelah menghapus item tanpa ulasan, halaman tidak berpindah ke `/katalog` dan terminal mencetak `"Gagal menghapus"` | Server (`hapusItem` di `app/katalog/actions.ts`) | `redirect()` bekerja dengan melempar galat internal `NEXT_REDIRECT` yang tertangkap oleh blok `try/catch` | `[hash-commit-fix-2]` |
| 3 | `#13` | Menghapus item yang memiliki ulasan gagal diam-diam tanpa pesan kesalahan ke pengguna | Basis data & Server (`prisma.item.delete` / `catch`) | Pelanggaran foreign key (`P2003`) karena baris `Ulasan` masih merujuk `itemId`, dan galat ditelan blok `catch` | `[hash-commit-fix-2]` |
| 4 | `#14` | Penghitung sisa karakter pada formulir ulasan tetap menampilkan `280` saat pengguna mengetik | Peramban / Klien (`components/FormUlasan.tsx`) | `useEffect` memakai larik dependensi kosong `[]` sehingga tidak pernah dijalankan ulang saat state `isi` berubah | `[hash-commit-fix-3]` |

---

## 3. Catatan Penelusuran

### 3.1 Galat 1: Status `"Tidak tersedia"` Tidak Pernah Tersimpan (`#11`)
- **Langkah reproduksi**:
  1. Jalankan konfigurasi `"Next.js: debug server-side"`, lalu buka halaman `/katalog/1/edit`.
  2. Pada kolom **Ketersediaan**, pilih opsi `"Tidak tersedia"`.
  3. Klik tombol **Simpan**, lalu buka halaman detail `/katalog/1`.
  - **Hasil yang diharapkan**: Halaman detail menampilkan status tidak tersedia (`"Sementara tidak tersedia"`).
  - **Hasil aktual**: Item tetap berstatus tersedia (`true`), meskipun pesan `"Perubahan disimpan."` muncul.
  - **Frekuensi**: 5 dari 5 percobaan (100%).

- **Bukti sebelum perbaikan**:
  - Pada tab **Network** Chrome DevTools (request `POST` dengan header `Next-Action`), bagian **Payload** menunjukkan field `tersedia` dikirim oleh peramban sebagai `"false"`.
  - Pada **Debug Console** VS Code saat breakpoint berhenti di baris `await prisma.item.update(...)`, hasil evaluasi `Object.fromEntries(formData).tersedia` adalah `'false'`, sedangkan `hasil.data.tersedia` bernilai `true`.
  - **Tangkapan Layar**:
    - `![Payload Network Galat 1](../screenshots/modul-07/02-galat1-network-payload.png)`
    - `![Debug Console dan Variables Galat 1](../screenshots/modul-07/03-galat1-debug-console.png)`

- **Akar penyebab dan perbaikan**:
  `z.coerce.boolean()` di Zod menggunakan fungsi bawaan `Boolean(input)`. Dalam JavaScript, setiap string tidak kosong—termasuk `"false"`—menghasilkan `true`. Skema diperbaiki menggunakan `z.stringbool()` dari Zod 4 yang memetakan `"true"` ke `true` dan `"false"` ke `false`:
  ```ts
  // lib/skema.ts
  import { z } from "zod";

  export const skemaItem = z.object({
    judul: z.string().trim().min(3, "Judul minimal 3 karakter."),
    kategori: z.enum(["energi", "lingkungan", "kampus"]),
    deskripsi: z.string().trim().max(500),
    tersedia: z.stringbool(),
  });

  export type MasukanItem = z.infer<typeof skemaItem>;
  ```

- **Bukti sesudah perbaikan**:
  Langkah reproduksi pada issue `#11` diulang sebanyak 5 kali. Pada breakpoint `prisma.item.update`, `hasil.data.tersedia` bernilai `false` dan halaman detail `/katalog/1` menampilkan `"Sementara tidak tersedia"` pada **5 dari 5 percobaan**.

---

### 3.2 Galat 2: `redirect()` Tertangkap `try/catch` Saat Hapus Item (`#12`)
- **Langkah reproduksi**:
  1. Buka halaman detail item yang tidak memiliki ulasan.
  2. Klik tombol **Hapus**.
  3. Perhatikan perpindahan halaman pada peramban dan log pada terminal server.
  - **Hasil yang diharapkan**: Item terhapus dari basis data dan pengguna diarahkan ke `/katalog`.
  - **Hasil aktual**: Item terhapus di basis data, tetapi halaman tetap diam di halaman detail dan terminal mencetak `"Gagal menghapus"`.
  - **Frekuensi**: 5 dari 5 percobaan pada item tanpa ulasan.

- **Bukti sebelum perbaikan**:
  - Breakpoint dipasang di dalam blok `catch` pada fungsi `hapusItem` (`app/katalog/actions.ts`).
  - Di **Debug Console**, `e.message` bernilai `'NEXT_REDIRECT'` dan `e.digest` bernilai `'NEXT_REDIRECT;replace;/katalog;303;'`, dengan frame teratas pada **Call Stack** menunjuk ke `hapusItem`.
  - **Tangkapan Layar**:
    - `![Debug Console dan Call Stack NEXT_REDIRECT](../screenshots/modul-07/04-galat2-next-redirect.png)`

- **Akar penyebab dan perbaikan**:
  Next.js mengimplementasikan fungsi `redirect()` dengan cara melempar galat khusus (`NEXT_REDIRECT`). Ketika `redirect("/katalog")` diletakkan di dalam blok `try/catch`, mekanisme pengalihan tersebut tertangkap oleh `catch` dan dibatalkan. Perbaikan dilakukan dengan memindahkan `redirect("/katalog")` ke luar blok penanganan galat (digabung dengan perbaikan Galat 3 pada subbagian 3.3).

- **Bukti sesudah perbaikan**:
  Setelah `redirect("/katalog")` dipindahkan ke luar blok, penghapusan item tanpa ulasan langsung mengalihkan halaman ke `/katalog` tanpa log galat palsu pada **5 dari 5 percobaan**.

---

### 3.3 Galat 3: Penghapusan Item Berulasan Memicu `P2003` & Penanganan `error.tsx` (`#13`)
- **Langkah reproduksi**:
  1. Buka halaman detail item yang memiliki minimal satu ulasan, lalu klik **Hapus**.
  2. Untuk menguji batas error boundary, buka halaman detail satu item di dua tab peramban sekaligus, hapus item di tab pertama, lalu klik **Hapus** di tab kedua.
  - **Hasil yang diharapkan**: Relasi ulasan dan item ditangani sesuai aturan produk lalu diarahkan ke `/katalog`; jika terjadi galat tak terduga (`P2025`), halaman `error.tsx` tampil dengan kode rujukan dan galat tercatat di terminal.
  - **Hasil aktual**: Sebelum perbaikan, log hanya mencetak `"Gagal menghapus"`, item berulasan gagal terhapus, dan pengguna tidak menerima umpan balik apa pun.
  - **Frekuensi**: 100% pada item yang memiliki ulasan.

- **Bukti sebelum perbaikan**:
  - Setelah mengganti sementara `console.log("Gagal menghapus")` menjadi `console.error(e)`, terminal menampilkan stack trace lengkap: `PrismaClientKnownRequestError` dengan `code: 'P2003'` (Foreign key constraint failed) pada pemanggilan `prisma.item.delete()` di `app/katalog/actions.ts`.
  - **Tangkapan Layar**:
    - `![Stack Trace Prisma P2003](../screenshots/modul-07/05-galat3-stacktrace-p2003.png)`
    - `![Tampilan error.tsx saat P2025](../screenshots/modul-07/06-galat3-error-boundary.png)`

- **Akar penyebab dan perbaikan**:
  Tabel `Ulasan` memiliki foreign key `itemId` yang merujuk `Item.id`, sehingga menghapus `Item` secara langsung memicu pelanggaran integritas referensial (`P2003`). Sesuai keputusan produk, penghapusan item akan menghapus seluruh ulasan terkait secara atomik melalui `prisma.$transaction([...])`, serta ditambahkan `app/katalog/[id]/error.tsx` untuk menangani galat tak terduga seperti `P2025`:
  ```ts
  // app/katalog/actions.ts
  export async function hapusItem(id: number) {
    await prisma.$transaction([
      prisma.ulasan.deleteMany({ where: { itemId: id } }),
      prisma.item.delete({ where: { id } }),
    ]);

    revalidatePath("/katalog");
    redirect("/katalog");
  }
  ```
  ```tsx
  // app/katalog/[id]/error.tsx
  "use client";

  import { useEffect } from "react";

  export default function GalatItem({
    error,
    retry,
  }: {
    error: Error & { digest?: string };
    retry: () => void;
  }) {
    useEffect(() => {
      console.error(error);
    }, [error]);

    return (
      <div role="alert" className="mx-auto max-w-xl p-4">
        <h2 className="text-xl font-bold">Item gagal diproses</h2>
        <p className="mt-2 text-sm text-gray-600">
          Kode rujukan: {error.digest ?? "tidak ada"}
        </p>
        <button
          type="button"
          onClick={() => retry()}
          className="mt-4 rounded border px-3 py-1"
        >
          Coba lagi
        </button>
      </div>
    );
  }
  ```

- **Bukti sesudah perbaikan**:
  - Menghapus item yang memiliki ulasan berhasil menghapus ulasan beserta item dalam satu transaksi dan berpindah ke `/katalog` pada **5 dari 5 percobaan**.
  - Menghapus item yang sama pada tab kedua memicu `P2025` yang tercatat di terminal dan menampilkan pesan ramah `"Item gagal diproses"` beserta `Kode rujukan` dari `error.tsx`.

---

### 3.4 Galat 4: Penghitung Karakter Ulasan Tidak Berubah (`#14`)
- **Langkah reproduksi**:
  1. Buka halaman detail item yang memuat komponen `<FormUlasan itemId={item.id} />`.
  2. Ketik beberapa kata pada kolom input ulasan (`textarea`).
  3. Amati label jumlah karakter tersisa di bawah kolom input.
  - **Hasil yang diharapkan**: Angka sisa karakter berkurang secara dinamis sesuai panjang teks yang diketik (`280 - isi.length`).
  - **Hasil aktual**: Teks selalu menampilkan `"280 karakter tersisa"`.
  - **Frekuensi**: 100% setiap kali pengguna mengetik.

- **Bukti sebelum perbaikan**:
  - Melalui tab **Components** pada React Developer Tools, state `isi` terlihat berubah mengikuti input pengguna, sedangkan state `sisa` tetap bernilai `280`.
  - Pada tab **Sources** DevTools, breakpoint di dalam `useEffect` hanya tersentuh saat komponen pertama kali dipasang (*mount*) dan tidak pernah dieksekusi ulang saat `isi` berubah karena array dependensi kosong `[]`.
  - **Tangkapan Layar**:
    - `![React DevTools Components sebelum perbaikan](../screenshots/modul-07/07-galat4-react-devtools.png)`

- **Akar penyebab dan perbaikan**:
  `sisa` adalah nilai turunan (*derived value*) dari state `isi`, sehingga menyimpannya dalam state terpisah dan memperbaruinya lewat `useEffect(..., [])` menyebabkan ketidaksinkronan UI. State `sisa` dan `useEffect` dihapus, lalu nilai dihitung langsung saat render:
  ```tsx
  // components/FormUlasan.tsx
  "use client";

  import { useActionState, useState } from "react";
  import { tambahUlasan, type StatusForm } from "@/app/katalog/actions";

  export default function FormUlasan({ itemId }: { itemId: number }) {
    const [state, formAction, pending] = useActionState<StatusForm, FormData>(
      tambahUlasan.bind(null, itemId),
      {},
    );
    const [isi, setIsi] = useState("");
    const sisa = 280 - isi.length;

    return (
      <form action={formAction} className="mt-6 space-y-2">
        <label htmlFor="isi" className="block font-medium">Ulasan</label>
        <textarea
          id="isi"
          name="isi"
          value={isi}
          maxLength={280}
          onChange={(e) => setIsi(e.target.value)}
          className="block w-full rounded border p-2"
        />
        <p className="text-sm text-gray-600">{sisa} karakter tersisa</p>
        <label htmlFor="nilai" className="block font-medium">Nilai (1-5)</label>
        <input
          id="nilai"
          name="nilai"
          type="number"
          min={1}
          max={5}
          required
          className="block w-24 rounded border px-3 py-2"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-blue-700 px-4 py-2 text-white"
        >
          Kirim
        </button>
        {state.pesan && <p role="status">{state.pesan}</p>}
      </form>
    );
  }
  ```

- **Bukti sesudah perbaikan**:
  Ketika mengetik `"halo"` (4 karakter), tampilan langsung memperbarui teks menjadi `"276 karakter tersisa"`. Pemeriksaan statis menggunakan `npm run lint` dan `npx tsc --noEmit` berjalan bersih tanpa error maupun warning.

---

## 4. Keputusan Teknis

1. **`z.stringbool()` dibanding alternatif lain (`z.coerce.boolean()` atau `z.preprocess`)**:
   - `z.coerce.boolean()` menggunakan `Boolean()`, yang mengonversi setiap string tidak kosong seperti `"false"` atau `"0"` menjadi `true`.
   - `z.preprocess()` bisa dipakai secara manual, tetapi `z.stringbool()` adalah fitur bawaan Zod 4 yang secara eksplisit dan aman hanya memetakan `"true"`/`"1"` ke `true` dan `"false"`/`"0"` ke `false`, serta otomatis menolak string lain sebagai galat validasi.

2. **Aturan hapus item berulasan (`prisma.$transaction` dibanding `onDelete: Cascade` atau menolak penghapusan)**:
   - Dipilih pendekatan `prisma.$transaction([prisma.ulasan.deleteMany(...), prisma.item.delete(...)])` karena menjamin sifat **atomik** (ulasan dan item terhapus bersamaan atau batal seluruhnya jika salah satu gagal) tanpa perlu mengubah skema migrasi Prisma (`onDelete: Cascade`) di tengah siklus rilis. Dibandingkan menolak penghapusan, aturan ini memudahkan administrator membersihkan item beserta data ulasan turunannya dalam satu aksi.

3. **Nilai turunan saat render dibanding `useEffect`**:
   - Menghitung `const sisa = 280 - isi.length;` langsung pada tubuh komponen mencegah siklus *double-render* yang tidak perlu, menghindari bug dependensi kosong `[]`, dan menjaga komponen tetap deklaratif sesuai panduan resmi React (*You Might Not Need an Effect*).

4. **Kapan galat ditangani di Server Action dan kapan diteruskan ke `error.tsx`**:
   - **Ditangani di Server Action**: Galat yang dapat diprediksi dari masukan pengguna (misalnya validasi Zod gagal) dikembalikan sebagai objek state `{ galat: ... }` agar pengguna dapat memperbaiki isian formulir tanpa kehilangan konteks halaman.
   - **Diteruskan ke `error.tsx`**: Galat tak terduga atau kondisi tidak konsisten pada server/database (seperti `P2025` saat record sudah terhapus di sesi lain, atau gangguan koneksi database) dibiarkan tidak ditelan agar tercatat lengkap di log server dan ditangkap oleh `app/katalog/[id]/error.tsx` dengan pesan ramah beserta `error.digest`.

---

## 5. Telaah Kode

- **Tautan PR Pasangan**: `[Masukkan URL Pull Request pasangan telaah Anda]`
- **Ringkasan komentar yang diberikan pada PR pasangan**:
  1. `lib/skema.ts:L12 | Validasi | z.coerce.number() mengubah string kosong menjadi 0 sehingga batas minimum tidak tervalidasi dengan benar | Gunakan z.coerce.number().int().min(1).max(5) (suggestion).`
  2. `app/katalog/actions.ts:L34 | Logika & Penanganan Galat | Pemanggilan redirect() masih berada di dalam blok try sehingga galat NEXT_REDIRECT tertangkap catch | Pindahkan redirect("/katalog") ke luar blok try/catch.`
  3. `components/FormUlasan.tsx:L14 | Keterbacaan | Nit: nama variabel temp kurang deskriptif untuk menampung teks ulasan | Ubah nama state menjadi isiUlasan agar maksudnya lebih jelas.`
- **Komentar yang diterima dari pasangan telaah & tindak lanjut**:
  - **Komentar 1 (`Diterapkan`)**: Pasangan menyarankan penambahan pengecekan pesan feedback `role="status"` agar lebih aksesibel dan konsisten. Saran diterapkan melalui commit tambahan sebelum PR digabungkan.
  - **Komentar 2 (`Ditolak dengan alasan teknis`)**: Pasangan menyarankan mengubah relasi skema menjadi `onDelete: Cascade` di `prisma/schema.prisma`. Saran tidak diterapkan karena proyek sudah menggunakan `prisma.$transaction` di Server Action untuk menjaga konsistensi migrasi yang sudah ada pada Milestone 2.

---

## 6. Kendala dan Penyelesaian

1. **Sinkronisasi OneDrive & Proses Server Mengunci Direktori Proyek**:
   - *Kendala*: Saat berpindah branch atau menjalankan perintah Git, muncul peringatan `Deletion of directory failed` karena folder proyek tersimpan di dalam folder OneDrive dan server `npm run dev` masih aktif.
   - *Penyelesaian*: Menghentikan server development (`Ctrl+C`), menjeda sinkronisasi OneDrive sementara saat operasi Git, dan memastikan file sementara/hasil generate tidak mengganggu working tree.
2. **Log Query Prisma Tidak Langsung Muncul Setelah Mengubah `lib/prisma.ts`**:
   - *Kendala*: Setelah menambahkan opsi `log: ["query", "warn", "error"]`, query SQL belum tercetak di terminal.
   - *Penyelesaian*: Karena instance `PrismaClient` di-cache pada `globalThis` selama mode development, sesi debugger/server dihentikan sepenuhnya (`Shift+F5`) lalu dijalankan ulang agar instance baru aktif.
3. **Breakpoint Berstatus Unbound pada Server Component**:
   - *Kendala*: Breakpoint di `app/katalog/page.tsx` awalnya berwarna abu-abu (`Unbound breakpoint`).
   - *Penyelesaian*: Menjalankan server menggunakan profil `"Next.js: debug server-side"`, membuka halaman `/katalog` sekali di peramban agar Next.js mengompilasi berkas dan source map-nya, lalu memuat ulang halaman.

---

## 7. Catatan Pemanfaatan AI

- **Alat yang digunakan**: Gemini (Asisten AI).
- **Perintah utama / tujuan penggunaan**:
  - Meminta bantuan analisis akar penyebab pada kode usulan AI untuk Modul 7 (`z.coerce.boolean()`, `redirect()` di dalam `try/catch`, `PrismaClientKnownRequestError P2003`, dan `useEffect` pada penghitung karakter).
  - Menyusun struktur dokumentasi teknis `docs/praktikum/modul-07.md` dan format komentar telaah kode.
- **Bagian kode yang berasal dari AI & galat yang ditemukan**:
  - Potongan awal pada `lib/skema.ts`, `app/katalog/actions.ts`, dan `components/FormUlasan.tsx` merupakan simulasi kode usulan AI yang mengandung empat bug logika/penanganan galat seperti tercatat pada Bagian 2 dan 3.
- **Perubahan yang dilakukan dan cara memverifikasinya**:
  - Mengganti `z.coerce.boolean()` menjadi `z.stringbool()`, memisahkan `redirect()` dari `try/catch`, menggunakan `prisma.$transaction` untuk penghapusan berelasi, menambahkan `app/katalog/[id]/error.tsx`, serta menghapus `useEffect` untuk nilai turunan `sisa`.
  - Seluruh perbaikan diverifikasi melalui reproduksi ulang setiap skenario (5/5 berhasil), inspeksi panel **Variables** dan **Debug Console** di VS Code, inspeksi **Network** dan **React Developer Tools** di Chrome, serta menjalankan `npm run lint` dan `npx tsc --noEmit` hingga bersih tanpa galat.