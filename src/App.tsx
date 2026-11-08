import { useEffect, useState } from 'react';
import { initialReports, type Report } from './data/mockData';
import { ReportForm } from './pages/ReportForm';
import { TrackReport } from './pages/TrackReport';
import { AdminDashboard } from './pages/AdminDashboard';
import { isAdminSession } from './lib/security/session';

type SessionState = 'checking' | 'guest' | 'authenticated' | 'error';

export default function App() {
  const [tab, setTab] = useState<'home' | 'report' | 'track' | 'admin'>('home');
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [sessionState, setSessionState] = useState<SessionState>('checking');

  const handleAddReport = (rep: Report) => setReports([rep, ...reports]);

  const handleUpdateStatus = (id: string, st: Report['status']) => {
    setReports(reports.map((r) => (r.id === id ? { ...r, status: st } : r)));
  };

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        const response = await fetch('/api/session', { credentials: 'same-origin' });
        const session: unknown = response.ok ? await response.json() : null;
        if (active) setSessionState(isAdminSession(session) ? 'authenticated' : 'guest');
      } catch (error) {
        console.error('Gagal memeriksa sesi server:', error);
        if (active) setSessionState('error');
      }
    };

    void checkSession();
    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    setSessionState('checking');
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
      if (!response.ok) {
        throw new Error(`Session request failed with status ${response.status}`);
      }
      setSessionState('guest');
    } catch (error) {
      console.error('Gagal mengakhiri sesi server:', error);
      setSessionState('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <header className="bg-slate-900 text-white sticky top-0 z-50">
        <nav aria-label="Navigasi Utama" className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <span onClick={() => setTab('home')} className="text-xl font-black text-amber-400 cursor-pointer">
            IntegritasKita
          </span>
          <div className="flex gap-2">
            <button onClick={() => setTab('home')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${tab === 'home' ? 'bg-amber-500 text-slate-950' : 'hover:bg-slate-800'}`}>Beranda</button>
            <button onClick={() => setTab('report')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${tab === 'report' ? 'bg-amber-500 text-slate-950' : 'hover:bg-slate-800'}`}>Laporkan</button>
            <button onClick={() => setTab('track')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${tab === 'track' ? 'bg-amber-500 text-slate-950' : 'hover:bg-slate-800'}`}>Lacak</button>
            <button onClick={() => setTab('admin')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${tab === 'admin' ? 'bg-amber-500 text-slate-950' : 'hover:bg-slate-800'}`}>Admin</button>
            <button
              onClick={() => void handleLogout()}
              disabled={sessionState !== 'authenticated'}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 text-slate-950 disabled:opacity-60"
            >
              {sessionState === 'authenticated' ? 'Keluar' : 'Auth server belum aktif'}
            </button>
          </div>
        </nav>
      </header>

      <div className="flex-1">
        {tab === 'home' && (
          <main className="max-w-3xl mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Platform Pengaduan Korupsi Anonim</h1>
            <p className="text-slate-600 mb-8">
              Terintegrasi dengan sistem keamanan hashing SHA-256 dan enkripsi AES-256-GCM untuk menjamin anonimitas pelapor.
            </p>
            <button onClick={() => setTab('report')} className="bg-amber-500 text-slate-950 font-bold px-6 py-3 rounded-xl hover:bg-amber-400 shadow">
              Mulai Buat Laporan
            </button>
          </main>
        )}
        {tab === 'report' && <ReportForm onAddReport={handleAddReport} />}
        {tab === 'track' && <TrackReport reports={reports} />}
        {tab === 'admin' && (
          sessionState === 'authenticated' ? (
            <AdminDashboard reports={reports} onUpdateStatus={handleUpdateStatus} />
          ) : (
            <main className="max-w-2xl mx-auto px-4 py-16 text-center" role="alert">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Akses admin ditolak</h1>
              <p className="text-slate-600">
                Panel admin dinonaktifkan sampai backend memverifikasi sesi dan peran admin.
              </p>
            </main>
          )
        )}
      </div>

      <footer className="bg-slate-900 text-slate-400 text-center py-4 text-xs border-t border-slate-800">
        <p role="status" className="mb-2">
          Sesi server: {sessionState === 'checking' ? 'memeriksa...' : sessionState === 'authenticated' ? 'aktif' : sessionState === 'guest' ? 'belum masuk' : 'gagal diperbarui'}
        </p>
        &copy; 2026 IntegritasKita - Milestone 1 Pemweb & Kripto.
      </footer>
    </div>
  );
}