// lib/data.ts
import "server-only";
import { prisma } from "@/lib/prisma";

const kolomKategori = {
  id: true,
  namaKategori: true,
  deskripsi: true,
} as const;

export async function ambilDaftarKategori() {
  return prisma.kategori.findMany({
    select: {
      ...kolomKategori,
      laporan: {
        select: { id: true, judul: true, status: true },
      },
    },
    orderBy: { dibuatPada: "desc" },
  });
}

export async function ambilDetailKategori(id: number) {
  return prisma.kategori.findUnique({
    where: { id },
    select: {
      ...kolomKategori,
      laporan: {
        select: {
          id: true,
          judul: true,
          lokasi: true,
          kronologi: true,
          status: true,
          dibuatPada: true,
        },
        orderBy: { dibuatPada: "desc" },
      },
    },
  });
}