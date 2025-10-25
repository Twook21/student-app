"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Search, Check, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface Prestasi {
  id: string;
  siswa: { nama: string; kelas: string };
  guru: { name: string };
  kategori: { nama: string };
  deskripsi: string;
  poin: number;
  status: string;
  tanggal: string;
  catatanBK?: string;
}

export default function PrestasiPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [prestasiList, setPrestasiList] = useState<Prestasi[]>([]);
  const [filteredPrestasi, setFilteredPrestasi] = useState<Prestasi[]>([]);
  const [siswaList, setSiswaList] = useState<any[]>([]);
  const [kategoriList, setKategoriList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPrestasi, setSelectedPrestasi] = useState<Prestasi | null>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [approvalData, setApprovalData] = useState({
    status: "",
    catatanBK: "",
  });
  const [formData, setFormData] = useState({
    siswaId: "",
    kategoriId: "",
    deskripsi: "",
    poin: "",
  });

  useEffect(() => {
    fetchPrestasi();
    fetchSiswa();
    fetchKategori();
  }, []);

  useEffect(() => {
    filterPrestasi();
  }, [searchQuery, prestasiList]);

  const fetchPrestasi = async () => {
    try {
      const response = await fetch("/api/prestasi");
      if (response.ok) {
        const data = await response.json();
        setPrestasiList(data);
        setFilteredPrestasi(data);
      }
    } catch (error) {
      console.error("Error fetching prestasi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSiswa = async () => {
    try {
      const response = await fetch("/api/siswa");
      if (response.ok) {
        const data = await response.json();
        setSiswaList(data);
      }
    } catch (error) {
      console.error("Error fetching siswa:", error);
    }
  };

  const fetchKategori = async () => {
    try {
      const response = await fetch("/api/kategori?tipe=PRESTASI");
      if (response.ok) {
        const data = await response.json();
        setKategoriList(data);
      }
    } catch (error) {
      console.error("Error fetching kategori:", error);
    }
  };

  const filterPrestasi = () => {
    if (!searchQuery) {
      setFilteredPrestasi(prestasiList);
      return;
    }

    const filtered = prestasiList.filter(
      (p) =>
        p.siswa.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.siswa.kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.kategori.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredPrestasi(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/prestasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          poin: parseInt(formData.poin),
        }),
      });

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Prestasi berhasil ditambahkan",
        });
        setIsDialogOpen(false);
        setFormData({ siswaId: "", kategoriId: "", deskripsi: "", poin: "" });
        fetchPrestasi();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Gagal menambahkan prestasi",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating prestasi:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const handleApproval = async () => {
    if (!selectedPrestasi) return;

    try {
      const response = await fetch(
        `/api/prestasi/${selectedPrestasi.id}/approve`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(approvalData),
        }
      );

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Status prestasi berhasil diperbarui",
        });
        setIsApprovalDialogOpen(false);
        setApprovalData({ status: "", catatanBK: "" });
        fetchPrestasi();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Gagal memperbarui status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error approving prestasi:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "MENUNGGU":
        return <Badge variant="outline" className="bg-yellow-100">Menunggu</Badge>;
      case "DISETUJUI":
        return <Badge variant="outline" className="bg-green-100">Disetujui</Badge>;
      case "DITOLAK":
        return <Badge variant="outline" className="bg-red-100">Ditolak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const canInput = session?.user?.role && ["WALIKELAS", "GURUMAPEL", "BK"].includes(session.user.role);
  const canApprove = session?.user?.role === "BK";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Prestasi</h1>
          <p className="text-muted-foreground">
            Kelola prestasi siswa
          </p>
        </div>
        {canInput && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Prestasi
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Input Prestasi</DialogTitle>
                <DialogDescription>
                  Masukkan data prestasi siswa
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siswa">Siswa</Label>
                  <Select
                    value={formData.siswaId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, siswaId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih siswa" />
                    </SelectTrigger>
                    <SelectContent>
                      {siswaList.map((siswa) => (
                        <SelectItem key={siswa.id} value={siswa.id}>
                          {siswa.nama} - {siswa.kelas}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kategori">Kategori</Label>
                  <Select
                    value={formData.kategoriId}
                    onValueChange={(value) => {
                      const kategori = kategoriList.find((k) => k.id === value);
                      setFormData({
                        ...formData,
                        kategoriId: value,
                        poin: kategori?.poinDefault.toString() || "",
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {kategoriList.map((kategori) => (
                        <SelectItem key={kategori.id} value={kategori.id}>
                          {kategori.nama} (+{kategori.poinDefault} poin)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="poin">Poin</Label>
                  <Input
                    id="poin"
                    type="number"
                    value={formData.poin}
                    onChange={(e) =>
                      setFormData({ ...formData, poin: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deskripsi">Deskripsi</Label>
                  <Textarea
                    id="deskripsi"
                    value={formData.deskripsi}
                    onChange={(e) =>
                      setFormData({ ...formData, deskripsi: e.target.value })
                    }
                    placeholder="Contoh: Juara 1 Lomba Web Design Tingkat Kota"
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari nama siswa, kelas, atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Memuat data...</div>
          ) : filteredPrestasi.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada data prestasi
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Siswa</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Guru</TableHead>
                    <TableHead className="text-right">Poin</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrestasi.map((prestasi) => (
                    <TableRow key={prestasi.id}>
                      <TableCell>
                        {format(new Date(prestasi.tanggal), "dd MMM yyyy", {
                          locale: idLocale,
                        })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {prestasi.siswa.nama}
                      </TableCell>
                      <TableCell>{prestasi.siswa.kelas}</TableCell>
                      <TableCell>{prestasi.kategori.nama}</TableCell>
                      <TableCell>{prestasi.guru.name}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        +{prestasi.poin}
                      </TableCell>
                      <TableCell>{getStatusBadge(prestasi.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedPrestasi(prestasi);
                            }}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          {canApprove && prestasi.status === "MENUNGGU" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedPrestasi(prestasi);
                                setIsApprovalDialogOpen(true);
                              }}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
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

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approval Prestasi</DialogTitle>
            <DialogDescription>
              Setujui atau tolak prestasi ini
            </DialogDescription>
          </DialogHeader>
          {selectedPrestasi && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Siswa:</span>{" "}
                  {selectedPrestasi.siswa.nama}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Kategori:</span>{" "}
                  {selectedPrestasi.kategori.nama}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Poin:</span>{" "}
                  +{selectedPrestasi.poin}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Deskripsi:</span>{" "}
                  {selectedPrestasi.deskripsi}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={approvalData.status}
                  onValueChange={(value) =>
                    setApprovalData({ ...approvalData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DISETUJUI">Disetujui</SelectItem>
                    <SelectItem value="DITOLAK">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Catatan BK</Label>
                <Textarea
                  value={approvalData.catatanBK}
                  onChange={(e) =>
                    setApprovalData({
                      ...approvalData,
                      catatanBK: e.target.value,
                    })
                  }
                  placeholder="Berikan catatan..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleApproval} className="flex-1">
                  Simpan
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsApprovalDialogOpen(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}