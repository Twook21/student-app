"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Siswa {
  id: string;
  nama: string;
  nis: string;
  kelas: string;
  totalPoin: number;
  waliKelas?: { name: string };
  orangTua?: { name: string };
}

export default function SiswaPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [filteredSiswa, setFilteredSiswa] = useState<Siswa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    nis: "",
    kelas: "",
    orangTuaId: "",
    waliKelasId: "",
  });

  useEffect(() => {
    fetchSiswa();
  }, []);

  useEffect(() => {
    filterSiswa();
  }, [searchQuery, siswaList]);

  const fetchSiswa = async () => {
    try {
      const response = await fetch("/api/siswa");
      if (response.ok) {
        const data = await response.json();
        setSiswaList(data);
        setFilteredSiswa(data);
      }
    } catch (error) {
      console.error("Error fetching siswa:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data siswa",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterSiswa = () => {
    if (!searchQuery) {
      setFilteredSiswa(siswaList);
      return;
    }

    const filtered = siswaList.filter(
      (siswa) =>
        siswa.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        siswa.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        siswa.kelas.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredSiswa(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/siswa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Siswa berhasil ditambahkan",
        });
        setIsDialogOpen(false);
        setFormData({
          nama: "",
          nis: "",
          kelas: "",
          orangTuaId: "",
          waliKelasId: "",
        });
        fetchSiswa();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Gagal menambahkan siswa",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating siswa:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const canEdit = session?.user?.role && ["SUPERADMIN", "BK"].includes(session.user.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Siswa</h1>
          <p className="text-muted-foreground">
            Kelola data siswa dan informasi poin
          </p>
        </div>
        {canEdit && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Siswa
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Siswa Baru</DialogTitle>
                <DialogDescription>
                  Masukkan data siswa baru
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Lengkap</Label>
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={(e) =>
                      setFormData({ ...formData, nama: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nis">NIS</Label>
                  <Input
                    id="nis"
                    value={formData.nis}
                    onChange={(e) =>
                      setFormData({ ...formData, nis: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kelas">Kelas</Label>
                  <Input
                    id="kelas"
                    placeholder="XI-RPL-1"
                    value={formData.kelas}
                    onChange={(e) =>
                      setFormData({ ...formData, kelas: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Simpan
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama, NIS, atau kelas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Memuat data...</div>
          ) : filteredSiswa.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada data siswa
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NIS</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Wali Kelas</TableHead>
                    <TableHead className="text-right">Total Poin</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSiswa.map((siswa) => (
                    <TableRow key={siswa.id}>
                      <TableCell className="font-medium">{siswa.nis}</TableCell>
                      <TableCell>{siswa.nama}</TableCell>
                      <TableCell>{siswa.kelas}</TableCell>
                      <TableCell>{siswa.waliKelas?.name || "-"}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-semibold ${
                            siswa.totalPoin < 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {siswa.totalPoin}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canEdit && (
                            <>
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}