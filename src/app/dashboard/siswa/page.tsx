"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Plus, Search, Eye, Edit, Trash2, GraduationCap, Loader2, AlertCircle, ChevronLeft, ChevronRight, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Siswa {
  id: string;
  nama: string;
  nis: string;
  kelas: string;
  gender: string;
  totalPoin: number;
  waliKelas?: { id: string; name: string };
  orangTua?: { id: string; name: string };
  user?: { email: string };
}

export default function SiswaPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    nis: "",
    kelas: "",
    gender: "",
    orangTuaId: "",
    waliKelasId: "",
    createAccount: false,
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchSiswa();
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const filteredSiswa = useMemo(() => {
    if (!searchQuery.trim()) return siswaList;

    const query = searchQuery.toLowerCase().trim();
    return siswaList.filter(
      (siswa) =>
        siswa.nama.toLowerCase().includes(query) ||
        siswa.nis.toLowerCase().includes(query) ||
        siswa.kelas.toLowerCase().includes(query)
    );
  }, [searchQuery, siswaList]);

  // Pagination
  const totalPages = Math.ceil(filteredSiswa.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSiswa = filteredSiswa.slice(startIndex, endIndex);

  const fetchSiswa = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/siswa");
      if (response.ok) {
        const data = await response.json();
        setSiswaList(data);
      } else {
        throw new Error("Failed to fetch siswa");
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

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsersList(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const openAddDialog = () => {
    setIsEditMode(false);
    setSelectedSiswa(null);
    setFormData({
      nama: "",
      nis: "",
      kelas: "",
      gender: "",
      orangTuaId: "",
      waliKelasId: "",
      createAccount: false,
      email: "",
      password: "",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (siswa: Siswa) => {
    setIsEditMode(true);
    setSelectedSiswa(siswa);
    setFormData({
      nama: siswa.nama,
      nis: siswa.nis,
      kelas: siswa.kelas,
      gender: siswa.gender,
      orangTuaId: siswa.orangTua?.id || "",
      waliKelasId: siswa.waliKelas?.id || "",
      createAccount: false,
      email: siswa.user?.email || "",
      password: "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = isEditMode ? `/api/siswa/${selectedSiswa?.id}` : "/api/siswa";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: isEditMode ? "Siswa berhasil diperbarui" : "Siswa berhasil ditambahkan",
        });
        setIsDialogOpen(false);
        setFormData({
          nama: "",
          nis: "",
          kelas: "",
          gender: "",
          orangTuaId: "",
          waliKelasId: "",
          createAccount: false,
          email: "",
          password: "",
        });
        fetchSiswa();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Gagal menyimpan data siswa",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating siswa:", error);
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
    if (!confirm(`Yakin ingin menghapus siswa "${nama}"?`)) return;

    try {
      const response = await fetch(`/api/siswa/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Siswa berhasil dihapus",
        });
        
        const newTotalPages = Math.ceil((filteredSiswa.length - 1) / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
        
        fetchSiswa();
      } else {
        toast({
          title: "Error",
          description: "Gagal menghapus siswa",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting siswa:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan pada server",
        variant: "destructive",
      });
    }
  };

  const canEdit = session?.user?.role && ["SUPERADMIN", "BK"].includes(session.user.role);
  const waliKelasList = usersList.filter(u => u.role === "WALIKELAS");
  const orangTuaList = usersList.filter(u => u.role === "ORANGTUA");

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
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50">
                Data Siswa
              </h1>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">
            Kelola data siswa dan informasi poin
          </p>
        </div>
        {canEdit && (
          <Button 
            onClick={openAddDialog}
            className="w-full sm:w-auto shadow-sm"
            size="default"
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="sm:inline">Tambah Siswa</span>
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
                placeholder="Cari nama, NIS, atau kelas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800"
              />
            </div>
            <div className="flex items-center gap-3">
              {filteredSiswa.length > 0 && (
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
                    {startIndex + 1}-{Math.min(endIndex, filteredSiswa.length)} dari {filteredSiswa.length}
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
          ) : filteredSiswa.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <AlertCircle className="h-12 w-12 mb-3 text-gray-300 dark:text-gray-700" />
              <p className="text-sm font-medium">
                {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data siswa"}
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
              <div className="hidden md:block rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">NIS</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Nama</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">L/P</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Kelas</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Wali Kelas</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">Total Poin</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSiswa.map((siswa) => (
                      <TableRow key={siswa.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                          {siswa.nis}
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">
                          {siswa.nama}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          <Badge variant="outline" className="border-gray-300 dark:border-gray-700">
                            {siswa.gender}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {siswa.kelas}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {siswa.waliKelas?.name || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-semibold ${
                              siswa.totalPoin < 0
                                ? "text-red-600 dark:text-red-400"
                                : "text-green-600 dark:text-green-400"
                            }`}
                          >
                            {siswa.totalPoin}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => {
                                setSelectedSiswa(siswa);
                                setIsDetailDialogOpen(true);
                              }}
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {canEdit && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => openEditDialog(siswa)}
                                  className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600 dark:hover:bg-yellow-950 dark:hover:text-yellow-400"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleDelete(siswa.id, siswa.nama)}
                                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                                >
                                  <Trash2 className="h-4 w-4" />
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

              {/* Mobile Card List */}
              <div className="md:hidden space-y-3 px-3 sm:px-4 pb-4">
                {paginatedSiswa.map((siswa) => (
                  <Card key={siswa.id} className="border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {siswa.nama}
                            </h3>
                            <Badge variant="outline" className="border-gray-300 dark:border-gray-700 text-xs">
                              {siswa.gender}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            NIS: {siswa.nis} • {siswa.kelas}
                          </p>
                        </div>
                        <div className="ml-3">
                          <div className={`text-lg font-bold ${
                            siswa.totalPoin < 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-green-600 dark:text-green-400"
                          }`}>
                            {siswa.totalPoin}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 text-right">poin</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-3 text-sm">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-500 w-24">Wali Kelas:</span>
                          <span className="truncate">{siswa.waliKelas?.name || "-"}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-500 w-24">Orang Tua:</span>
                          <span className="truncate">{siswa.orangTua?.name || "-"}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedSiswa(siswa);
                            setIsDetailDialogOpen(true);
                          }}
                          className="flex-1 h-9 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          Detail
                        </Button>
                        {canEdit && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => openEditDialog(siswa)}
                              className="flex-1 h-9 border-yellow-200 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-900 dark:text-yellow-400 dark:hover:bg-yellow-950"
                            >
                              <Edit className="h-3.5 w-3.5 mr-1.5" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(siswa.id, siswa.nama)}
                              className="h-9 w-9 p-0 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {isEditMode ? "Edit Siswa" : "Tambah Siswa Baru"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode ? "Perbarui data siswa yang dipilih" : "Masukkan data siswa baru ke sistem"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nama" className="text-sm font-medium">
                  Nama Lengkap <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nama"
                  placeholder="Masukkan nama lengkap"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  className="h-10"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nis" className="text-sm font-medium">
                  NIS <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nis"
                  placeholder="Masukkan NIS"
                  value={formData.nis}
                  onChange={(e) =>
                    setFormData({ ...formData, nis: e.target.value })
                  }
                  className="h-10"
                  required
                  disabled={isEditMode || isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kelas" className="text-sm font-medium">
                  Kelas <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="kelas"
                  placeholder="Contoh: XI-RPL-1"
                  value={formData.kelas}
                  onChange={(e) =>
                    setFormData({ ...formData, kelas: e.target.value })
                  }
                  className="h-10"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Pilih jenis kelamin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Laki-laki</SelectItem>
                    <SelectItem value="P">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="waliKelas" className="text-sm font-medium">
                  Wali Kelas
                </Label>
                <Select
                  value={formData.waliKelasId === "" ? "none" : formData.waliKelasId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, waliKelasId: value === "none" ? "" : value })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Pilih wali kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    {waliKelasList.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="orangTua" className="text-sm font-medium">
                  Orang Tua
                </Label>
                <Select
                  value={formData.orangTuaId === "" ? "none" : formData.orangTuaId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, orangTuaId: value === "none" ? "" : value })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Pilih orang tua" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak Ada</SelectItem>
                    {orangTuaList.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!isEditMode && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                  <div className="flex items-start space-x-2 mb-4">
                    <input
                      type="checkbox"
                      id="createAccount"
                      checked={formData.createAccount}
                      onChange={(e) =>
                        setFormData({ ...formData, createAccount: e.target.checked })
                      }
                      className="h-4 w-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled={isSubmitting}
                    />
                    <div>
                      <Label htmlFor="createAccount" className="cursor-pointer text-sm font-medium">
                        Buat akun login untuk siswa ini
                      </Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Siswa dapat login untuk melihat poin mereka
                      </p>
                    </div>
                  </div>

                  {formData.createAccount && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email Login <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="siswa@email.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="h-10"
                          required={formData.createAccount}
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium">
                          Password <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Minimal 6 karakter"
                          value={formData.password}
                          onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                          }
                          className="h-10"
                          required={formData.createAccount}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

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

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                <User className="h-5 w-5" />
              </div>
              Detail Siswa
            </DialogTitle>
          </DialogHeader>
          {selectedSiswa && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {selectedSiswa.nama}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>NIS: {selectedSiswa.nis}</span>
                    <span>•</span>
                    <Badge variant="outline" className="border-gray-300 dark:border-gray-700">
                      {selectedSiswa.gender === "L" ? "Laki-laki" : "Perempuan"}
                    </Badge>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className={`text-3xl font-bold ${
                    selectedSiswa.totalPoin < 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-green-600 dark:text-green-400"
                  }`}>
                    {selectedSiswa.totalPoin}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Poin</p>
                </div>
              </div>

              {/* Detail Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Kelas
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {selectedSiswa.kelas}
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Wali Kelas
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {selectedSiswa.waliKelas?.name || "-"}
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Orang Tua
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {selectedSiswa.orangTua?.name || "-"}
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Akun Login
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {selectedSiswa.user?.email || "Tidak ada"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              {canEdit && (
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => {
                      setIsDetailDialogOpen(false);
                      openEditDialog(selectedSiswa);
                    }}
                    className="flex-1 h-10"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Data
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailDialogOpen(false)}
                    className="flex-1 h-10"
                  >
                    Tutup
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}