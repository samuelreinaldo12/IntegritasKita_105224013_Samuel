import React, { useState } from 'react';
import type { Report } from '../data/mockData';

export const TrackReport: React.FC<{ reports: Report[] }> = ({ reports }) => {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<Report | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = reports.find((r) => r.code.toUpperCase() === code.trim().toUpperCase());
    setResult(found || null);
    setSearched(true);
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-center mb-2">Pelacakan Status Laporan</h1>
      <p className="text-center text-slate-600 text-sm mb-6">Masukkan kode unik pelacakan anonim Anda.</p>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          type="text"
          placeholder="Contoh: IK-A8F931C2"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <button type="submit" className="bg-amber-500 text-slate-950 font-bold px-6 py-3 rounded-xl hover:bg-amber-400">
          Cari
        </button>
      </form>

      {searched && !result && (
        <div className="p-4 bg-rose-50 text-rose-700 text-center rounded-xl text-sm">
          Kode laporan tidak ditemukan. Pastikan Anda memasukkan token yang benar.
        </div>
      )}

      {result && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-md space-y-3">
          <div className="flex justify-between items-center border-b pb-3">
            <span className="font-mono font-bold text-lg text-amber-600">{result.code}</span>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">{result.status}</span>
          </div>
          <p className="text-sm"><strong>Kategori:</strong> {result.category}</p>
          <p className="text-sm"><strong>Lokasi:</strong> {result.location}</p>
          <p className="text-sm"><strong>Tanggal:</strong> {result.date}</p>
          <p className="text-sm"><strong>Bukti:</strong> {result.evidenceName}</p>
          <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700">{result.description}</div>
        </div>
      )}
    </main>
  );
};