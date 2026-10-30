// components/FormLaporan.tsx
"use client";

import { useState } from "react";
import { skemaPengaduan } from "../lib/skema"; 

export default function FormLaporan() {
  const [formData, setFormData] = useState({
    kategori: "",
    lokasi: "",
    judul: "",
    kronologi: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sukses, setSukses] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSukses(false);
    setErrors({});

    const result = skemaPengaduan.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue: any) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
    } else {
      setErrors({});
      setSukses(true);
      console.log("Data Laporan Valid:", result.data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg space-y-4 font-sans">
      <h2 className="text-2xl font-bold text-gray-900">Form Pengaduan Anonim</h2>
      <p className="text-sm text-gray-600">Sampaikan laporan dugaan korupsi secara aman dan terstruktur.</p>

      {/* Kategori */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Kategori Kasus</label>
        <select 
          name="kategori" 
          value={formData.kategori} 
          onChange={handleChange}
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Pilih kategori pelanggaran</option>
          <option value="Pungli">Pungutan Liar (Pungli)</option>
          <option value="Suap">Suap & Gratifikasi</option>
          <option value="Pengadaan">Pengadaan Barang & Jasa</option>
        </select>
        {errors.kategori && <p className="text-red-600 text-sm mt-1">{errors.kategori}</p>}
      </div>

      {/* Lokasi Kejadian */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Lokasi Kejadian *</label>
        <input 
          type="text" 
          name="lokasi" 
          value={formData.lokasi} 
          onChange={handleChange}
          placeholder="Contoh: Dinas X / Kantor Kecamatan Y"
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.lokasi && <p className="text-red-600 text-sm mt-1">{errors.lokasi}</p>}
      </div>

      {/* Judul Laporan */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Judul Laporan</label>
        <input 
          type="text" 
          name="judul" 
          value={formData.judul} 
          onChange={handleChange}
          placeholder="Ringkasan singkat kasus"
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.judul && <p className="text-red-600 text-sm mt-1">{errors.judul}</p>}
      </div>

      {/* Kronologi */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Kronologi Singkat</label>
        <textarea 
          name="kronologi" 
          value={formData.kronologi} 
          onChange={handleChange}
          rows={4}
          placeholder="Ceritakan detail kejadian secara kronologis..."
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.kronologi && <p className="text-red-600 text-sm mt-1">{errors.kronologi}</p>}
      </div>

      {/* Tombol Submit */}
      <button 
        type="submit" 
        className="w-full bg-blue-600 text-white py-2 px-4 rounded font-medium hover:bg-blue-700 transition"
      >
        Validasi & Kirim Laporan
      </button>

      {/* Pesan Sukses */}
      {sukses && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded text-center font-medium">
          ✅ Laporan berhasil divalidasi dengan skema Zod dan siap diproses!
        </div>
      )}
    </form>
  );
}