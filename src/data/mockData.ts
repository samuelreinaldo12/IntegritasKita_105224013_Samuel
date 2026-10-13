export interface Report {
  id: string;
  code: string;
  category: string;
  location: string;
  date: string;
  description: string;
  status: 'Menunggu Verifikasi' | 'Sedang Investigasi' | 'Selesai' | 'Ditolak';
  evidenceName: string;
}

export const initialReports: Report[] = [
  {
    id: '1',
    code: 'IK-A8F931C2',
    category: 'Pengadaan Barang & Jasa',
    location: 'Dinas Pekerjaan Umum',
    date: '2026-10-10',
    description: 'Dugaan mark-up anggaran pengadaan proyek jalan.',
    status: 'Sedang Investigasi',
    evidenceName: 'RAB_Proyek.pdf'
  },
  {
    id: '2',
    code: 'IK-B3E41209',
    category: 'Pungutan Liar (Pungli)',
    location: 'Kantor Kecamatan X',
    date: '2026-10-12',
    description: 'Permintaan imbalan tak resmi perizinan usaha.',
    status: 'Menunggu Verifikasi',
    evidenceName: 'Bukti_Pungli.jpg'
  }
];