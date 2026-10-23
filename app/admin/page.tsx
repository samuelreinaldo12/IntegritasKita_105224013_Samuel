import Link from "next/link";

const daftarLaporanAdmin = [
  { id: 1, token: "IK-A8F931C2", kategori: "Pengadaan Barang & Jasa", lokasi: "Dinas Pekerjaan Utama", status: "Sedang Investigasi" },
  { id: 2, token: "IK-B3E41209", kategori: "Pungutan Liar (Pungli)", lokasi: "Kantor Kecamatan X", status: "Menunggu Verifikasi" },
];

export default function AdminDashboardPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto font-sans">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dasbor Pengawasan Admin</h1>
      <p className="text-gray-600 mb-6 text-sm">Klik pada Kode Token untuk melihat detail pengaduan.</p>
      
      <div className="overflow-x-auto border rounded-lg bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
              <th className="p-3">KODE TOKEN</th>
              <th className="p-3">KATEGORI</th>
              <th className="p-3">LOKASI</th>
              <th className="p-3">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {daftarLaporanAdmin.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="p-3 font-semibold">
                  {/* PENTING: Komponen <Link> ini yang bikin kodenya BISA DIKLIK dan pindah halaman */}
                  <Link 
                    href={`/admin/reports/${item.token}`} 
                    className="text-amber-600 hover:text-amber-700 underline flex items-center gap-1"
                  >
                    🔍 {item.token}
                  </Link>
                </td>
                <td className="p-3 text-gray-800">{item.kategori}</td>
                <td className="p-3 text-gray-600">{item.lokasi}</td>
                <td className="p-3">
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}