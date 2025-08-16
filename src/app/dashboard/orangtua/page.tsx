import { Card } from "@/components/ui/card";

export default function OrangtuaDashboard() {
  return (
    <div className="p-6">
      <Card>
        <h2 className="text-xl font-bold mb-2">Dashboard Orangtua</h2>
        <p>Lihat data anak dan point mereka.</p>
      </Card>
      {/* Tambahkan tabel anak dan point di sini */}
    </div>
  );
}
