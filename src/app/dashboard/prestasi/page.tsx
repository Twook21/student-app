"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Plus, Search, Check, Trophy, Eye, Loader2, AlertCircle, ChevronLeft, ChevronRight, Award } from "lucide-react";
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
  const [siswaList, setSiswaList] = useState<any[]>([]);
  const [kategoriList, setKategoriList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPrestasi, setSelectedPrestasi] = useState<Prestasi | null>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const filteredPrestasi = useMemo(() => {
    if (!searchQuery.trim()) return prestasiList;

    const query = searchQuery.toLowerCase().trim();
    return prestasiList.filter(
      (p) =>
        p.siswa.nama.toLowerCase().includes(query) ||
        p.siswa.kelas.toLowerCase().includes(query) ||
        p.kategori.nama.toLowerCase().includes(query)
    );
  }, [searchQuery, prestasiList]);

  // Pagination
  const totalPages = Math.ceil(filteredPrestasi.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPrestasi = filteredPrestasi.slice(startIndex, endIndex);

  const fetchPrestasi = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/prestasi");
      if (response.ok) {
        const data = await response.json();
        setPrestasiList(data);
      } else {
        throw new Error("Failed to fetch prestasi");
      }
    } catch (error) {
      console.error("Error fetching prestasi:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data prestasi",
        variant: "destructive",
      });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

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
        description: "Terjadi kesalahan pada server",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproval = async () => {
    if (!selectedPrestasi) return;
    setIsSubmitting(true);

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
        description: "Terjadi kesalahan pada server",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      MENUNGGU: { label: "Menunggu", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300" },
      DISETUJUI: { label: "Disetujui", className: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" },
      DITOLAK: { label: "Ditolak", className: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" },
    };

    const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-700" };
    
    return (
      <Badge className={`${config.className} border-0 font-medium`} variant="secondary">
        {config.label}
      </Badge>
    );
  };

  const canInput = session?.user?.role && ["WALIKELAS", "GURUMAPEL", "BK"].includes(session.user.role);
  const canApprove = session?.user?.role === "BK";

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => goToPage(i)}
          className={`h-8 w-8 p-0 ${
            currentPage === i
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          {i}
        </Button>
      );
    }

    return buttons;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50">
                Data Prestasi
              </h1>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">
            Kelola prestasi siswa
          </p>
        </div>
        {canInput && (
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="w-full sm:w-auto shadow-sm"
            size="default"
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="sm:inline">Tambah Prestasi</span>
          </Button>
        )}
      </div>

      {/* Main Card */}
      <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
        <CardHeader className="space-y-0 pb-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Cari nama siswa, kelas, atau kategori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800"
              />
            </div>
            <div className="flex items-center gap-3">
              {filteredPrestasi.length > 0 && (
                <>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="itemsPerPage" className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      Tampilkan:
                    </Label>
                    <Select
                      value={itemsPerPage.toString()}
                      onValueChange={(value) => setItemsPerPage(Number(value))}
                    >
                      <SelectTrigger id="itemsPerPage" className="h-9 w-[70px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {startIndex + 1}-{Math.min(endIndex, filteredPrestasi.length)} dari {filteredPrestasi.length}
                  </div>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <Loader2 className="h-8 w-8 animate-spin mb-3 text-blue-600 dark:text-blue-400" />
              <p className="text-sm">Memuat data...</p>
            </div>
          ) : filteredPrestasi.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <AlertCircle className="h-12 w-12 mb-3 text-gray-300 dark:text-gray-700" />
              <p className="text-sm font-medium">
                {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data prestasi"}
              </p>
              {searchQuery && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Coba kata kunci lain
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Tanggal</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Siswa</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Kelas</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Kategori</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Guru</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">Poin</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPrestasi.map((prestasi) => (
                      <TableRow key={prestasi.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {new Date(prestasi.tanggal).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                          {prestasi.siswa.nama}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {prestasi.siswa.kelas}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {prestasi.kategori.nama}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {prestasi.guru.name}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600 dark:text-green-400">
                          +{prestasi.poin}
                        </TableCell>
                        <TableCell>{getStatusBadge(prestasi.status)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedPrestasi(prestasi);
                                setIsDetailDialogOpen(true);
                              }}
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {canApprove && prestasi.status === "MENUNGGU" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedPrestasi(prestasi);
                                  setIsApprovalDialogOpen(true);
                                }}
                                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950 dark:hover:text-green-400"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile/Tablet Card List */}
              <div className="lg:hidden space-y-3 px-3 sm:px-4 pb-4">
                {paginatedPrestasi.map((prestasi) => (
                  <Card key={prestasi.id} className="border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate mb-1">
                            {prestasi.siswa.nama}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {prestasi.siswa.kelas} • {new Date(prestasi.tanggal).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="ml-3 text-right">
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            +{prestasi.poin}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">poin</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-3 text-sm">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-500 w-20">Kategori:</span>
                          <span className="truncate">{prestasi.kategori.nama}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-500 w-20">Guru:</span>
                          <span className="truncate">{prestasi.guru.name}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-500 w-20">Status:</span>
                          {getStatusBadge(prestasi.status)}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedPrestasi(prestasi);
                            setIsDetailDialogOpen(true);
                          }}
                          className="flex-1 h-9 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          Detail
                        </Button>
                        {canApprove && prestasi.status === "MENUNGGU" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPrestasi(prestasi);
                              setIsApprovalDialogOpen(true);
                            }}
                            className="h-9 w-9 p-0 border-green-200 text-green-600 hover:bg-green-50 dark:border-green-900 dark:text-green-400 dark:hover:bg-green-950"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-3 sm:px-0 pt-4 border-t border-gray-200 dark:border-gray-800 mt-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Halaman {currentPage} dari {totalPages}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-8"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Prev</span>
                    </Button>
                    
                    <div className="hidden sm:flex items-center gap-1">
                      {renderPaginationButtons()}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-8"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Input Prestasi</DialogTitle>
            <DialogDescription>
              Masukkan data prestasi siswa
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siswa" className="text-sm font-medium">
                Siswa <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.siswaId}
                onValueChange={(value) =>
                  setFormData({ ...formData, siswaId: value })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-10">
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
              <Label htmlFor="kategori" className="text-sm font-medium">
                Kategori <span className="text-red-500">*</span>
              </Label>
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
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-10">
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
              <Label htmlFor="poin" className="text-sm font-medium">
                Poin <span className="text-red-500">*</span>
              </Label>
              <Input
                id="poin"
                type="number"
                placeholder="Masukkan poin prestasi"
                value={formData.poin}
                onChange={(e) =>
                  setFormData({ ...formData, poin: e.target.value })
                }
                className="h-10"
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Poin akan otomatis terisi sesuai kategori
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deskripsi" className="text-sm font-medium">
                Deskripsi <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="deskripsi"
                placeholder="Contoh: Juara 1 Lomba Web Design Tingkat Kota"
                value={formData.deskripsi}
                onChange={(e) =>
                  setFormData({ ...formData, deskripsi: e.target.value })
                }
                rows={4}
                required
                disabled={isSubmitting}
              />
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
                  "Simpan"
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

      {/* Approval Dialog */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Approval Prestasi</DialogTitle>
            <DialogDescription>
              Setujui atau tolak prestasi ini
            </DialogDescription>
          </DialogHeader>
          {selectedPrestasi && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Siswa</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {selectedPrestasi.siswa.nama}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Kategori</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {selectedPrestasi.kategori.nama}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Poin</span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    +{selectedPrestasi.poin}
                  </span>
                </div>
                <div className="pt-2 border-t border-green-200 dark:border-green-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Deskripsi:</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {selectedPrestasi.deskripsi}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={approvalData.status}
                  onValueChange={(value) =>
                    setApprovalData({ ...approvalData, status: value })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DISETUJUI">Disetujui</SelectItem>
                    <SelectItem value="DITOLAK">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Catatan BK</Label>
                <Textarea
                  value={approvalData.catatanBK}
                  onChange={(e) =>
                    setApprovalData({
                      ...approvalData,
                      catatanBK: e.target.value,
                    })
                  }
                  placeholder="Berikan catatan (opsional)..."
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button 
                  onClick={handleApproval} 
                  className="flex-1 h-10"
                  disabled={isSubmitting || !approvalData.status}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsApprovalDialogOpen(false)}
                  className="flex-1 h-10"
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400">
                <Award className="h-5 w-5" />
              </div>
              Detail Prestasi
            </DialogTitle>
          </DialogHeader>
          {selectedPrestasi && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex items-start justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {selectedPrestasi.siswa.nama}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>{selectedPrestasi.siswa.kelas}</span>
                    <span>•</span>
                    <span>{new Date(selectedPrestasi.tanggal).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}</span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    +{selectedPrestasi.poin}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Poin</p>
                </div>
              </div>

              {/* Detail Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Kategori
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {selectedPrestasi.kategori.nama}
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Guru Input
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {selectedPrestasi.guru.name}
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg sm:col-span-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Status
                  </p>
                  {getStatusBadge(selectedPrestasi.status)}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Deskripsi Prestasi</p>
                </div>
                <p className="text-sm text-gray-900 dark:text-gray-100">{selectedPrestasi.deskripsi}</p>
              </div>

              {selectedPrestasi.catatanBK && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">
                    Catatan BK
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{selectedPrestasi.catatanBK}</p>
                </div>
              )}

              <Button
                onClick={() => setIsDetailDialogOpen(false)}
                className="w-full h-10"
                variant="outline"
              >
                Tutup
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}