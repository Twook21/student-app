import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SiswaDashboard() {
  return (
    <div className="p-6">
      <Card>
        <h2 className="text-xl font-bold mb-2">Dashboard Siswa</h2>
        <p>Lihat point, notifikasi, dan data kelas.</p>
        <Button>Lihat Detail Point</Button>
      </Card>
      {/* Tambahkan tabel point, notifikasi, dsb */}
    </div>
  );
}
