import React, { useState } from 'react';
import type { Report } from '../data/mockData';

interface AdminProps {
  reports: Report[];
  onUpdateStatus: (id: string, newStatus: Report['status']) => void;
}

export const AdminDashboard: React.FC<AdminProps> = ({ reports, onUpdateStatus }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === 'admin' && pass === 'admin123') {
      setIsAuth(true);
      setErr('');
    } else {
      setErr('Kredensial Admin salah! (Gunakan: admin / admin123)');
    }
  };

  if (!isAuth) {
    return (
      <main className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">Portal Admin Terenkripsi</h1>
          <p className="text-slate-500 text-sm mb-6 text-center">Akses terbatas untuk verifikasi & verifikator laporan.</p>

          {err && <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-xs rounded-lg">{err}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-user" className="block text-sm font-medium text-slate-700 mb-1">Username Admin</label>
              <input
                id="admin-user"
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="admin-pass" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                id="admin-pass"
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>
            <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition">
              Masuk Sistem
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dasbor Pengawasan Admin</h1>
          <p className="text-slate-600 text-sm">Kelola dan ubah status pengaduan masyarakat.</p>
        </div>
        <button onClick={() => setIsAuth(false)} className="bg-rose-100 text-rose-700 text-xs font-bold px-4 py-2 rounded-lg hover:bg-rose-200">
          Keluar Admin
        </button>
      </div>

      <div className="bg-white shadow border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-semibold">
              <tr>
                <th className="p-4">Kode Token</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Lokasi</th>
                <th className="p-4">Bukti Terlampir</th>
                <th className="p-4">Status</th>
                <th className="p-4">Ubah Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {reports.map((r) => (
                <tr key={r.id}>
                  <td className="p-4 font-mono font-bold text-amber-600">{r.code}</td>
                  <td className="p-4 font-medium">{r.category}</td>
                  <td className="p-4">{r.location}</td>
                  <td className="p-4 text-xs font-mono text-slate-500">{r.evidenceName}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={r.status}
                      onChange={(e) => onUpdateStatus(r.id, e.target.value as Report['status'])}
                      className="border border-slate-300 text-xs rounded p-1"
                    >
                      <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                      <option value="Sedang Investigasi">Sedang Investigasi</option>
                      <option value="Selesai">Selesai</option>
                      <option value="Ditolak">Ditolak</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};