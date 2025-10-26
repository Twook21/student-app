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
import { Plus, Edit, Trash2, FolderKanban, Loader2, AlertCircle } from "lucide-react";
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState<Kategori | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      setIsLoading(true);
      const response = await fetch("/api/kategori");
      if (response.ok) {
        const data = await response.json();
        setKategoriList(data);
      } else {
        throw new Error("Failed to fetch kategori");
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

  const openAddDialog = () => {
    setIsEditMode(false);
    setSelectedKategori(null);
    setFormData({ nama: "", tipe: "", poinDefault: "" });
    setIsDialogOpen(true);
  };

  const openEditDialog = (kategori: Kategori) => {
    setIsEditMode(true);
    setSelectedKategori(kategori);
    setFormData({
      nama: kategori.nama,
      tipe: kategori.tipe,
      poinDefault: kategori.poinDefault.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = isEditMode ? `/api/kategori/${selectedKategori?.id}` : "/api/kategori";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          poinDefault: parseInt(formData.poinDefault),
        }),
      });

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: isEditMode ? "Kategori berhasil diperbarui" : "Kategori berhasil ditambahkan",
        });
        setIsDialogOpen(false);
        setFormData({ nama: "", tipe: "", poinDefault: "" });
        fetchKategori();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || (isEditMode ? "Gagal memperbarui kategori" : "Gagal menambahkan kategori"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting kategori:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan pada server",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Yakin ingin menghapus kategori "${nama}"?`)) return;

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
        description: "Terjadi kesalahan pada server",
        variant: "destructive",
      });
    }
  };

  const pelanggaranList = kategoriList.filter((k) => k.tipe === "PELANGGARAN");
  const prestasiList = kategoriList.filter((k) => k.tipe === "PRESTASI");

  const renderKategoriTable = (list: Kategori[], tipe: "PELANGGARAN" | "PRESTASI") => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin mb-3 text-blue-600 dark:text-blue-400" />
          <p className="text-sm">Memuat data...</p>
        </div>
      );
    }

    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
          <AlertCircle className="h-12 w-12 mb-3 text-gray-300 dark:text-gray-700" />
          <p className="text-sm font-medium">
            Belum ada kategori {tipe === "PELANGGARAN" ? "pelanggaran" : "prestasi"}
          </p>
        </div>
      );
    }

    return (
      <>
        {/* Desktop Table */}
        <div className="hidden md:block rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Nama Kategori</TableHead>
                <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">Poin Default</TableHead>
                <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((kategori) => (
                <TableRow key={kategori.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                  <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                    {kategori.nama}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge 
                      variant="outline" 
                      className={`border-0 font-medium ${
                        tipe === "PELANGGARAN" 
                          ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                          : "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                      }`}
                    >
                      {tipe === "PELANGGARAN" ? "-" : "+"}{kategori.poinDefault}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => openEditDialog(kategori)}
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(kategori.id, kategori.nama)}
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card List */}
        <div className="md:hidden space-y-3">
          {list.map((kategori) => (
            <Card key={kategori.id} className="border-gray-200 dark:border-gray-800 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {kategori.nama}
                    </h3>
                    <Badge 
                      variant="outline" 
                      className={`border-0 font-medium ${
                        tipe === "PELANGGARAN" 
                          ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                          : "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                      }`}
                    >
                      {tipe === "PELANGGARAN" ? "-" : "+"}{kategori.poinDefault} poin
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => openEditDialog(kategori)}
                    className="flex-1 h-9 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950"
                  >
                    <Edit className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(kategori.id, kategori.nama)}
                    className="flex-1 h-9 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Hapus
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50">
                Kategori
              </h1>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">
            Kelola kategori pelanggaran dan prestasi
          </p>
        </div>
        <Button 
          onClick={openAddDialog}
          className="w-full sm:w-auto shadow-sm"
          size="default"
        >
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="sm:inline">Tambah Kategori</span>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pelanggaran" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="pelanggaran" className="data-[state=active]:bg-red-100 dark:data-[state=active]:bg-red-900/50 data-[state=active]:text-red-700 dark:data-[state=active]:text-red-300">
            <span className="text-sm sm:text-base">Pelanggaran</span>
            <Badge 
              variant="secondary" 
              className="ml-2 bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-200"
            >
              {pelanggaranList.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="prestasi" className="data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900/50 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-300">
            <span className="text-sm sm:text-base">Prestasi</span>
            <Badge 
              variant="secondary" 
              className="ml-2 bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-200"
            >
              {prestasiList.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pelanggaran" className="mt-4">
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                Kategori Pelanggaran
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Daftar kategori pelanggaran siswa
              </p>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 sm:pt-0">
              {renderKategoriTable(pelanggaranList, "PELANGGARAN")}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prestasi" className="mt-4">
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                Kategori Prestasi
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Daftar kategori prestasi siswa
              </p>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 sm:pt-0">
              {renderKategoriTable(prestasiList, "PRESTASI")}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {isEditMode ? "Edit Kategori" : "Tambah Kategori Baru"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode ? "Perbarui data kategori" : "Masukkan data kategori baru"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama" className="text-sm font-medium">
                Nama Kategori <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                placeholder="Contoh: Terlambat, Juara Lomba"
                className="h-10"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tipe" className="text-sm font-medium">
                Tipe <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.tipe}
                onValueChange={(value) =>
                  setFormData({ ...formData, tipe: value })
                }
                disabled={isSubmitting || isEditMode}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PELANGGARAN">Pelanggaran</SelectItem>
                  <SelectItem value="PRESTASI">Prestasi</SelectItem>
                </SelectContent>
              </Select>
              {isEditMode && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Tipe tidak dapat diubah setelah dibuat
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="poinDefault" className="text-sm font-medium">
                Poin Default <span className="text-red-500">*</span>
              </Label>
              <Input
                id="poinDefault"
                type="number"
                value={formData.poinDefault}
                onChange={(e) =>
                  setFormData({ ...formData, poinDefault: e.target.value })
                }
                placeholder="10"
                className="h-10"
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Poin yang akan digunakan secara default untuk kategori ini
              </p>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button 
                type="submit" 
                className="flex-1 h-10" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>{isEditMode ? "Perbarui" : "Simpan"}</>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1 h-10"
                disabled={isSubmitting}
              >
                Batal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}