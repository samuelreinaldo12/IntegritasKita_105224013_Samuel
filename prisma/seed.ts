import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Memulai proses seeding data sintetis...");

  // Hapus data lama jika ada (opsional untuk reset)
  await prisma.laporan.deleteMany();
  await prisma.kategori.deleteMany();

  // Buat Kategori
  const kategori1 = await prisma.kategori.create({
    data: {
      namaKategori: "Infrastruktur Publik",
      deskripsi: "Laporan terkait penyelewengan dana atau kerusakan fasilitas umum.",
    },
  });

  const kategori2 = await prisma.kategori.create({
    data: {
      namaKategori: "Pengadaan Barang & Jasa",
      deskripsi: "Dugaan korupsi dalam tender dan pengadaan proyek pemerintah.",
    },
  });

  // Buat Laporan Sintetis (Sesuai ketentuan, menggunakan data sintetis)
  await prisma.laporan.create({
    data: {
      judul: "Dugaan Mark-up Dana Perbaikan Jalan Desa",
      lokasi: "Kecamatan Cilegon Utara",
      kronologi: "Ditemukan indikasi penggelembungan anggaran pada proyek betonisasi jalan lingkungan sepanjang 2 kilometer yang tidak sesuai spesifikasi teknis awal.",
      status: "MENUNGGU",
      kategoriId: kategori1.id,
    },
  });

  await prisma.laporan.create({
    data: {
      judul: "Kejanggalan Tender Pengadaan Alat Kesehatan",
      lokasi: "Dinas Kesehatan Kota",
      kronologi: "Proses lelang pengadaan alat kesehatan RSUD diduga dikondisikan untuk memenangkan perusahaan tertentu tanpa melalui evaluasi terbuka yang adil.",
      status: "DIPROSES",
      kategoriId: kategori2.id,
    },
  });

  console.log("Seeding data berhasil diselesaikan!");
}

main()
  .catch((e) => {
    console.error("Gagal melakukan seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });