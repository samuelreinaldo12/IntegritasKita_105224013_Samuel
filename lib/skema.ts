// lib/skema.ts
import { z } from "zod";

export const skemaPengaduan = z.object({
  kategori: z.string().min(1, "Silakan pilih kategori pengaduan terlebih dahulu"),
  lokasi: z.string().trim()
    .min(3, "Lokasi kejadian minimal harus 3 karakter")
    .max(100, "Lokasi maksimal 100 karakter"),
  judul: z.string().trim()
    .min(5, "Judul laporan minimal 5 karakter")
    .max(100, "Judul maksimal 100 karakter"),
  kronologi: z.string().trim()
    .min(15, "Kronologi kejadian minimal 15 karakter agar jelas")
    .max(500, "Kronologi maksimal 500 karakter"),
});

export type TipePengaduan = z.infer<typeof skemaPengaduan>;