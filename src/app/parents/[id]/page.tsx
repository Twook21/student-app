import { Card } from "@/components/ui/card";
import { Table } from "@/components/ui/table";

export default function ParentDetailPage() {
  // Fetch data orangtua dan anak dari API
  return (
    <div className="p-6">
      <Card>
        <h2 className="text-xl font-bold mb-2">Detail Orangtua</h2>
        {/* Data orangtua */}
        <Table>{/* Tabel anak dan point mereka */}</Table>
      </Card>
    </div>
  );
}
