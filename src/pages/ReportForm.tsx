import React, { useState } from 'react';
import type { Report } from '../data/mockData';
import { generateSHA256Hash } from '../lib/crypto/cryptoService';

interface ReportFormProps {
  onAddReport: (newReport: Report) => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({ onAddReport }) => {
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!category) newErrors.category = 'Pilih kategori dugaan korupsi.';
    if (!location.trim()) newErrors.location = 'Lokasi wajib diisi.';
    if (!description.trim() || description.length < 20) {
      newErrors.description = 'Kronologi minimal 20 karakter.';
    }
    if (!evidence) {
      newErrors.evidence = 'Wajib mengunggah bukti pendukung.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Menggunakan SHA-256 untuk menghasilkan Token Pelacakan Anonim
    const fullHash = await generateSHA256Hash(description + Date.now());
    const token = 'IK-' + fullHash.substring(0, 8).toUpperCase();

    const newReport: Report = {
      id: Date.now().toString(),
      code: token,
      category,
      location,
      date: new Date().toISOString().split('T')[0],
      description,
      status: 'Menunggu Verifikasi',
      evidenceName: evidence ? evidence.name : 'Bukti.pdf',
    };

    onAddReport(newReport);
    setSubmittedCode(token);
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 border border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Formulir Pengaduan Anonim</h1>
        <p className="text-slate-600 text-sm mb-6">
          Identitas Anda dijamin 100% anonim. Sistem menggunakan hashing SHA-256 untuk menjaga privasi.
        </p>

        {submittedCode ? (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-6 rounded-xl text-center space-y-3">
            <h2 className="text-xl font-bold">Laporan Berhasil Terkirim!</h2>
            <p className="text-sm">Kode Unik Pelacakan (SHA-256 Hash Token):</p>
            <div className="text-2xl font-mono font-bold bg-white py-2 px-4 inline-block rounded border border-emerald-200 text-amber-600 shadow-inner">
              {submittedCode}
            </div>
            <div>
              <button
                onClick={() => {
                  setSubmittedCode(null);
                  setCategory('');
                  setLocation('');
                  setDescription('');
                  setEvidence(null);
                  setErrors({});
                }}
                className="mt-4 bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 text-sm font-semibold transition"
              >
                Buat Laporan Baru
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Kategori Dugaan Korupsi <span className="text-rose-500">*</span>
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base text-slate-800 bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none shadow-sm cursor-pointer"
              >
                <option value="" className="text-slate-500 text-base">-- Pilih Kategori --</option>
                <option value="Pengadaan Barang & Jasa" className="text-slate-800 text-base py-2">Pengadaan Barang & Jasa</option>
                <option value="Penyalahgunaan Wewenang" className="text-slate-800 text-base py-2">Penyalahgunaan Wewenang</option>
                <option value="Pungutan Liar (Pungli)" className="text-slate-800 text-base py-2">Pungutan Liar (Pungli)</option>
                <option value="Suap & Gratifikasi" className="text-slate-800 text-base py-2">Suap & Gratifikasi</option>
              </select>
              {errors.category && <p className="text-rose-600 text-xs mt-1 font-medium">{errors.category}</p>}
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Lokasi Kejadian <span className="text-rose-500">*</span>
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Dinas Pekerjaan Umum Kota X"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base text-slate-800 bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none shadow-sm"
              />
              {errors.location && <p className="text-rose-600 text-xs mt-1 font-medium">{errors.location}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Kronologi / Rincian Laporan <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan secara rinci kronologi dugaan korupsi (minimal 20 karakter)..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base text-slate-800 bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none shadow-sm"
              />
              {errors.description && <p className="text-rose-600 text-xs mt-1 font-medium">{errors.description}</p>}
            </div>

            <div>
              <label htmlFor="evidence" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Unggah Bukti Pendukung <span className="text-rose-500">*</span>
              </label>
              <input
                id="evidence"
                type="file"
                onChange={(e) => e.target.files && setEvidence(e.target.files[0])}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
              />
              {errors.evidence && <p className="text-rose-600 text-xs mt-1 font-medium">{errors.evidence}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              Kirim Laporan Anonim
            </button>
          </form>
        )}
      </div>
    </main>
  );
};