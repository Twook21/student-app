import { Card } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="p-6">
      <Card>
        <h2 className="text-xl font-bold mb-2">Profil Saya</h2>
        {/* Data profil user dari session/API */}
      </Card>
    </div>
  );
}
