import { Card } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="p-6">
      <Card>
        <h2 className="text-xl font-bold mb-2">Dashboard Admin</h2>
        <p>Kelola data siswa, guru, kelas, dan point.</p>
      </Card>
      {/* Tambahkan komponen kelola data di sini */}
    </div>
  );
}
