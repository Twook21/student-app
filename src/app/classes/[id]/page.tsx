import { Card } from "@/components/ui/card";
import { Table } from "@/components/ui/table";

export default function ClassDetailPage() {
  // Fetch data kelas dan siswa dari API
  return (
    <div className="p-6">
      <Card>
        <h2 className="text-xl font-bold mb-2">Detail Kelas</h2>
        {/* Data kelas */}
        <Table>{/* Tabel siswa di kelas */}</Table>
      </Card>
    </div>
  );
}
