// app/lapor/page.tsx
import FormLaporan from "../../components/FormLaporan";

export default function HalamanLapor() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
          IntegritasKita - Layanan Pengaduan
        </h1>
        <FormLaporan />
      </div>
    </main>
  );
}