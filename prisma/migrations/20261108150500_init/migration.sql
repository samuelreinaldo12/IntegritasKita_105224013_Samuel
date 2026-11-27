-- CreateTable
CREATE TABLE "Kategori" (
    "id" SERIAL NOT NULL,
    "namaKategori" TEXT NOT NULL,
    "deskripsi" TEXT,
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Laporan" (
    "id" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "kronologi" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'MENUNGGU',
    "dibuatPada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kategoriId" INTEGER NOT NULL,

    CONSTRAINT "Laporan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Kategori_namaKategori_key" ON "Kategori"("namaKategori");

-- CreateIndex
CREATE UNIQUE INDEX "Laporan_judul_key" ON "Laporan"("judul");

-- AddForeignKey
ALTER TABLE "Laporan" ADD CONSTRAINT "Laporan_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "Kategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
