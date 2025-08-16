import { Card } from "@/components/ui/card";
import { Table } from "@/components/ui/table";

export default function StudentDetailPage() {
  // Fetch data siswa dan point dari API
  return (
    <div className="p-6">
      <Card>
        <h2 className="text-xl font-bold mb-2">Detail Siswa</h2>
        {/* Data siswa */}
        <Table>{/* Tabel point siswa */}</Table>
      </Card>
    </div>
  );
}
