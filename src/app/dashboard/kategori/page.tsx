"use client";

import { useEffect, useState } from "react";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Kategori {
  id: string;
  nama: string;
  tipe: string;
  poinDefault: number;
}

export default function KategoriPage() {
  const { toast } = useToast();
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    tipe: "",
    poinDefault: "",
  });

  useEffect(() => {
    fetchKategori();
  }, []);

  const fetchKategori = async () => {
    try {
      const response = await fetch("/api/kategori");
      if (response.ok) {
        const data = await response.json();
        setKategoriList(data);
      }
    } catch (error) {
      console.error("Error fetching kategori:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data kategori",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/kategori", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          poinDefault: parseInt(formData.poinDefault),
        }),
      });

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Kategori berhasil ditambahkan",
        });
        setIsDialogOpen(false);
        setFormData({ nama: "", tipe: "", poinDefault: "" });
        fetchKategori();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Gagal menambahkan kategori",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating kategori:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus kategori ini?")) return;

    try {
      const response = await fetch(`/api/kategori/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Kategori berhasil dihapus",
        });
        fetchKategori();
      } else {
        toast({
          title: "Error",
          description: "Gagal menghapus kategori",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting kategori:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const pelanggaranList = kategoriList.filter((k) => k.tipe === "PELANGGARAN");
  const prestasiList = kategoriList.filter((k) => k.tipe === "PRESTASI");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kategori</h1>
          <p className="text-muted-foreground">
            Kelola kategori pelanggaran dan prestasi
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Kategori
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Kategori Baru</DialogTitle>
              <DialogDescription>
                Masukkan data kategori baru
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Kategori</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  placeholder="Contoh: Terlambat, Juara Lomba"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipe">Tipe</Label>
                <Select
                  value={formData.tipe}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tipe: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PELANGGARAN">Pelanggaran</SelectItem>
                    <SelectItem value="PRESTASI">Prestasi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="poinDefault">Poin Default</Label>
                <Input
                  id="poinDefault"
                  type="number"
                  value={formData.poinDefault}
                  onChange={(e) =>
                    setFormData({ ...formData, poinDefault: e.target.value })
                  }
                  placeholder="10"
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
      </div>

      <Tabs defaultValue="pelanggaran" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pelanggaran">
            Pelanggaran ({pelanggaranList.length})
          </TabsTrigger>
          <TabsTrigger value="prestasi">
            Prestasi ({prestasiList.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pelanggaran">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Kategori Pelanggaran</h3>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Memuat data...</div>
              ) : pelanggaranList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Tidak ada kategori pelanggaran
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Kategori</TableHead>
                        <TableHead className="text-right">Poin Default</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pelanggaranList.map((kategori) => (
                        <TableRow key={kategori.id}>
                          <TableCell className="font-medium">
                            {kategori.nama}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline" className="bg-red-100">
                              -{kategori.poinDefault}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(kategori.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
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
        </TabsContent>

        <TabsContent value="prestasi">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Kategori Prestasi</h3>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Memuat data...</div>
              ) : prestasiList.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Tidak ada kategori prestasi
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Kategori</TableHead>
                        <TableHead className="text-right">Poin Default</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prestasiList.map((kategori) => (
                        <TableRow key={kategori.id}>
                          <TableCell className="font-medium">
                            {kategori.nama}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="outline" className="bg-green-100">
                              +{kategori.poinDefault}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(kategori.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}