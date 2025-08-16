import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function GuruDashboard() {
  return (
    <div className="p-6">
      <Card>
        <h2 className="text-xl font-bold mb-2">Dashboard Guru</h2>
        <p>Input dan pantau point siswa, kelola kelas.</p>
        <Button>Input Point Siswa</Button>
      </Card>
      {/* Tambahkan tabel siswa, input point, dsb */}
    </div>
  );
}
