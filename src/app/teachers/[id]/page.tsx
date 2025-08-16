import { Card } from "@/components/ui/card";
import { Table } from "@/components/ui/table";

export default function TeacherDetailPage() {
  // Fetch data guru dan kelas dari API
  return (
    <div className="p-6">
      <Card>
        <h2 className="text-xl font-bold mb-2">Detail Guru</h2>
        {/* Data guru */}
        <Table>{/* Tabel kelas yang diampu */}</Table>
      </Card>
    </div>
  );
}
