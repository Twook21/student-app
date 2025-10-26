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
import { Plus, Search, Check, X, Eye, AlertTriangle, Loader2, AlertCircle, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { PhotoUpload } from "@/components/photo-upload";
import Image from "next/image";

interface Pelanggaran {
  id: string;
  siswa: { nama: string; kelas: string };
  guru: { name: string };
  kategori: { nama: string };
  deskripsi: string;
  poin: number;
  status: string;
  tanggal: string;
  alasanSiswa?: string;
  catatanBK?: string;
  fotoUrl?: string;
  needsWaliKelasApproval?: boolean;
}

export default function PelanggaranPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [pelanggaranList, setPelanggaranList] = useState<Pelanggaran[]>([]);
  const [siswaList, setSiswaList] = useState<any[]>([]);
  const [kategoriList, setKategoriList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPelanggaran, setSelectedPelanggaran] = useState<Pelanggaran | null>(null);
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
    fotoUrl: "",
  });

  useEffect(() => {
    fetchPelanggaran();
    fetchSiswa();
    fetchKategori();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const filteredPelanggaran = useMemo(() => {
    if (!searchQuery.trim()) return pelanggaranList;

    const query = searchQuery.toLowerCase().trim();
    return pelanggaranList.filter(
      (p) =>
        p.siswa.nama.toLowerCase().includes(query) ||
        p.siswa.kelas.toLowerCase().includes(query) ||
        p.kategori.nama.toLowerCase().includes(query)
    );
  }, [searchQuery, pelanggaranList]);

  // Pagination
  const totalPages = Math.ceil(filteredPelanggaran.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPelanggaran = filteredPelanggaran.slice(startIndex, endIndex);

  const fetchPelanggaran = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/pelanggaran");
      if (response.ok) {
        const data = await response.json();
        setPelanggaranList(data);
      } else {
        throw new Error("Failed to fetch pelanggaran");
      }
    } catch (error) {
      console.error("Error fetching pelanggaran:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data pelanggaran",
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
      const response = await fetch("/api/kategori?tipe=PELANGGARAN");
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
      const response = await fetch("/api/pelanggaran", {
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
          description: "Pelanggaran berhasil ditambahkan",
        });
        setIsDialogOpen(false);
        setFormData({ siswaId: "", kategoriId: "", deskripsi: "", poin: "", fotoUrl: "" });
        fetchPelanggaran();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Gagal menambahkan pelanggaran",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating pelanggaran:", error);
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
    if (!selectedPelanggaran) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/pelanggaran/${selectedPelanggaran.id}/approve`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(approvalData),
        }
      );

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Status pelanggaran berhasil diperbarui",
        });
        setIsApprovalDialogOpen(false);
        setApprovalData({ status: "", catatanBK: "" });
        fetchPelanggaran();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Gagal memperbarui status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error approving pelanggaran:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan pada server",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWaliKelasApproval = async (pelanggaranId: string, approved: boolean) => {
    try {
      const response = await fetch(
        `/api/pelanggaran/${pelanggaranId}/approve-walikelas`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ approved }),
        }
      );
      
      if (response.ok) {
        toast({
          title: "Berhasil",
          description: approved ? "Pelanggaran disetujui" : "Pelanggaran ditolak",
        });
        fetchPelanggaran();
      } else {
        throw new Error("Failed to approve");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan",
        variant: "destructive",
      });
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
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50">
                Data Pelanggaran
              </h1>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">
            Kelola pelanggaran siswa
          </p>
        </div>
        {canInput && (
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="w-full sm:w-auto shadow-sm"
            size="default"
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="sm:inline">Tambah Pelanggaran</span>
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
              {filteredPelanggaran.length > 0 && (
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
                    {startIndex + 1}-{Math.min(endIndex, filteredPelanggaran.length)} dari {filteredPelanggaran.length}
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
          ) : filteredPelanggaran.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <AlertCircle className="h-12 w-12 mb-3 text-gray-300 dark:text-gray-700" />
              <p className="text-sm font-medium">
                {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data pelanggaran"}
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
                    {paginatedPelanggaran.map((pelanggaran) => (
                      <TableRow key={pelanggaran.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {new Date(pelanggaran.tanggal).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                          {pelanggaran.siswa.nama}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {pelanggaran.siswa.kelas}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {pelanggaran.kategori.nama}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {pelanggaran.guru.name}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600 dark:text-red-400">
                          -{pelanggaran.poin}
                        </TableCell>
                        <TableCell>{getStatusBadge(pelanggaran.status)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedPelanggaran(pelanggaran);
                                setIsDetailDialogOpen(true);
                              }}
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {session?.user?.role === "WALIKELAS" && 
                             pelanggaran.needsWaliKelasApproval && 
                             pelanggaran.status === "MENUNGGU" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    if (confirm("Setujui pelanggaran ini?")) {
                                      handleWaliKelasApproval(pelanggaran.id, true);
                                    }
                                  }}
                                  className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950 dark:hover:text-green-400"
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    if (confirm("Tolak pelanggaran ini?")) {
                                      handleWaliKelasApproval(pelanggaran.id, false);
                                    }
                                  }}
                                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            
                            {canApprove && 
                             pelanggaran.status === "MENUNGGU" && 
                             !pelanggaran.needsWaliKelasApproval && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedPelanggaran(pelanggaran);
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
                {paginatedPelanggaran.map((pelanggaran) => (
                  <Card key={pelanggaran.id} className="border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate mb-1">
                            {pelanggaran.siswa.nama}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {pelanggaran.siswa.kelas} • {new Date(pelanggaran.tanggal).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="ml-3 text-right">
                          <div className="text-lg font-bold text-red-600 dark:text-red-400">
                            -{pelanggaran.poin}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">poin</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-3 text-sm">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-500 w-20">Kategori:</span>
                          <span className="truncate">{pelanggaran.kategori.nama}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-500 w-20">Guru:</span>
                          <span className="truncate">{pelanggaran.guru.name}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-500 w-20">Status:</span>
                          {getStatusBadge(pelanggaran.status)}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedPelanggaran(pelanggaran);
                            setIsDetailDialogOpen(true);
                          }}
                          className="flex-1 h-9 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          Detail
                        </Button>
                        
                        {session?.user?.role === "WALIKELAS" && 
                         pelanggaran.needsWaliKelasApproval && 
                         pelanggaran.status === "MENUNGGU" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (confirm("Setujui pelanggaran ini?")) {
                                  handleWaliKelasApproval(pelanggaran.id, true);
                                }
                              }}
                              className="h-9 w-9 p-0 border-green-200 text-green-600 hover:bg-green-50 dark:border-green-900 dark:text-green-400 dark:hover:bg-green-950"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (confirm("Tolak pelanggaran ini?")) {
                                  handleWaliKelasApproval(pelanggaran.id, false);
                                }
                              }}
                              className="h-9 w-9 p-0 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        
                        {canApprove && 
                         pelanggaran.status === "MENUNGGU" && 
                         !pelanggaran.needsWaliKelasApproval && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPelanggaran(pelanggaran);
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
            <DialogTitle className="text-xl">Input Pelanggaran</DialogTitle>
            <DialogDescription>
              Masukkan data pelanggaran siswa
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
                      {kategori.nama} ({kategori.poinDefault} poin)
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
                placeholder="Masukkan poin pelanggaran"
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
                placeholder="Jelaskan detail pelanggaran..."
                value={formData.deskripsi}
                onChange={(e) =>
                  setFormData({ ...formData, deskripsi: e.target.value })
                }
                rows={4}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Foto Bukti (Opsional)
              </Label>
              <PhotoUpload
                onPhotoCapture={(photoDataUrl) =>
                  setFormData({ ...formData, fotoUrl: photoDataUrl })
                }
                currentPhoto={formData.fotoUrl}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Ambil foto sebagai bukti pelanggaran
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

      {/* Approval Dialog BK */}
      <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Approval Pelanggaran</DialogTitle>
            <DialogDescription>
              Setujui atau tolak pelanggaran ini
            </DialogDescription>
          </DialogHeader>
          {selectedPelanggaran && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Siswa</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {selectedPelanggaran.siswa.nama}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Kategori</span>
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {selectedPelanggaran.kategori.nama}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Poin</span>
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                    -{selectedPelanggaran.poin}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Deskripsi:</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {selectedPelanggaran.deskripsi}
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
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              Detail Pelanggaran
            </DialogTitle>
          </DialogHeader>
          {selectedPelanggaran && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex items-start justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {selectedPelanggaran.siswa.nama}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>{selectedPelanggaran.siswa.kelas}</span>
                    <span>•</span>
                    <span>{new Date(selectedPelanggaran.tanggal).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}</span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    -{selectedPelanggaran.poin}
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
                    {selectedPelanggaran.kategori.nama}
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Guru Input
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {selectedPelanggaran.guru.name}
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg sm:col-span-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Status
                  </p>
                  {getStatusBadge(selectedPelanggaran.status)}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Deskripsi</p>
                <p className="text-sm text-gray-900 dark:text-gray-100">{selectedPelanggaran.deskripsi}</p>
              </div>

              {selectedPelanggaran.fotoUrl && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Camera className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Foto Bukti</p>
                  </div>
                  <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                    <Image
                      src={selectedPelanggaran.fotoUrl}
                      alt="Foto Bukti"
                      fill
                      className="object-contain bg-gray-50 dark:bg-gray-900"
                    />
                  </div>
                </div>
              )}

              {selectedPelanggaran.alasanSiswa && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">
                    Alasan Banding dari Siswa
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{selectedPelanggaran.alasanSiswa}</p>
                </div>
              )}

              {selectedPelanggaran.catatanBK && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Catatan BK
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{selectedPelanggaran.catatanBK}</p>
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