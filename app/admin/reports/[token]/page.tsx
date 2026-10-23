import Link from "next/link";
import { notFound } from "next/navigation";
import "server-only";

// Fungsi mock untuk mencari data laporan berdasarkan token admin
function cariLaporanByToken(token: string) {
  const databaseMock = [
    { token: "IK-A8F931C2", kategori: "Pengadaan Barang & Jasa", lokasi: "Dinas Pekerjaan Umum", kronologi: "Ditemukan indikasi penggelembungan dana proyek pengadaan fasilitas kantor tahun 2026.", bukti: "RAB_Proyek.pdf", status: "Sedang Investigasi", tanggal: "12 Oktober 2026" },
    { token: "IK-B3E41209", kategori: "Pungutan Liar (Pungli)", lokasi: "Kantor Kecamatan X", kronologi: "Adanya pungutan liar sebesar Rp500.000 untuk pengurusan surat keterangan domisili.", bukti: "Bukti_Pungli.jpg", status: "Menunggu Verifikasi", tanggal: "13 Oktober 2026" },
  ];
  return databaseMock.find((item) => item.token === token);
}

export default async function HalamanDetailAdmin({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Validasi format token menggunakan Regex (harus berformat IK-XXXXXXXX)
  const tokenRegex = /^IK-[0-9A-Fa-f]{8}$/;
  if (!tokenRegex.test(token)) {
    notFound();
  }

  const laporan = cariLaporanByToken(token);
  if (!laporan) {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg mt-8">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Detail Laporan Pengaduan</span>
          <h1 className="text-2xl font-bold text-gray-900">{laporan.token}</h1>
        </div>
        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
          {laporan.status}
        </span>
      </div>

      <div className="space-y-4 text-gray-700">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Kategori Kasus</h3>
          <p className="text-lg font-semibold text-gray-800">{laporan.kategori}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Lokasi Kejadian</h3>
          <p className="text-base">{laporan.lokasi}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Kronologi / Deskripsi Laporan</h3>
          <p className="p-4 bg-gray-50 rounded border text-gray-800 leading-relaxed">{laporan.kronologi}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Berkas Bukti Pendukung</h3>
          <a href="#" className="text-amber-600 hover:underline font-medium inline-flex items-center gap-1 mt-1">
            📄 {laporan.bukti} (Unduh / Pratinjau)
          </a>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500">Tanggal Pengaduan</h3>
          <p className="text-sm text-gray-600">{laporan.tanggal}</p>
        </div>
      </div>

      <div className="mt-8 border-t pt-4 flex justify-between items-center">
        <Link href="/admin" className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm font-medium">
          ← Kembali ke Dasbor Admin
        </Link>
        <button className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 text-sm font-medium">
          Simpan Perubahan Status
        </button>
      </div>
    </main>
  );
}