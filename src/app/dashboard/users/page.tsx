"use client";

import { useEffect, useState, useMemo } from "react";
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
import { Plus, Search, Edit, Trash2, Users as UsersIcon, Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  createdAt: string;
}

export default function UsersPage() {
  const { toast } = useToast();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    phone: "",
    mapel: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset to page 1 when search or items per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  // Optimized filtering with useMemo
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return usersList;

    const query = searchQuery.toLowerCase().trim();
    return usersList.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
    );
  }, [searchQuery, usersList]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsersList(data);
      } else {
        throw new Error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openAddDialog = () => {
    setIsEditMode(false);
    setSelectedUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "",
      phone: "",
      mapel: "",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setIsEditMode(true);
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      phone: user.phone || "",
      mapel: "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = isEditMode ? `/api/users/${selectedUser?.id}` : "/api/auth/register";
      const method = isEditMode ? "PUT" : "POST";

      const payload: any = {
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
      };

      if (!isEditMode) {
        payload.email = formData.email;
        payload.password = formData.password;
      }

      if (isEditMode && formData.password) {
        payload.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: isEditMode ? "User berhasil diperbarui" : "User berhasil ditambahkan",
        });
        setIsDialogOpen(false);
        setFormData({ name: "", email: "", password: "", role: "", phone: "", mapel: "" });
        fetchUsers();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || (isEditMode ? "Gagal memperbarui user" : "Gagal menambahkan user"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting user:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan pada server",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus user "${name}"?`)) return;

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "User berhasil dihapus",
        });
        
        // Adjust page if current page becomes empty
        const newTotalPages = Math.ceil((filteredUsers.length - 1) / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
        
        fetchUsers();
      } else {
        toast({
          title: "Error",
          description: "Gagal menghapus user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan pada server",
        variant: "destructive",
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { label: string; className: string }> = {
      SUPERADMIN: { label: "Super Admin", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300" },
      BK: { label: "Guru BK", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" },
      WALIKELAS: { label: "Wali Kelas", className: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" },
      GURUMAPEL: { label: "Guru Mapel", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300" },
      ORANGTUA: { label: "Orang Tua", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
    };

    const config = roleConfig[role] || { label: role, className: "bg-gray-100 text-gray-700" };
    
    return (
      <Badge className={`${config.className} border-0 font-medium`} variant="secondary">
        {config.label}
      </Badge>
    );
  };

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
              <UsersIcon className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50">
                Data User
              </h1>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">
            Kelola data pengguna sistem
          </p>
        </div>
        <Button 
          onClick={openAddDialog}
          className="w-full sm:w-auto shadow-sm"
          size="default"
        >
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="sm:inline">Tambah User</span>
        </Button>
      </div>

      {/* Main Card */}
      <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
        <CardHeader className="space-y-0 pb-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Cari nama, email, atau role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800"
              />
            </div>
            <div className="flex items-center gap-3">
              {filteredUsers.length > 0 && (
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
                    {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} dari {filteredUsers.length}
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
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <AlertCircle className="h-12 w-12 mb-3 text-gray-300 dark:text-gray-700" />
              <p className="text-sm font-medium">
                {searchQuery ? "Tidak ada hasil pencarian" : "Belum ada data user"}
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
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Nama</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Email</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">No. Telepon</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Role</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Tanggal Dibuat</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                          {user.name}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {user.phone || "-"}
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => openEditDialog(user)}
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(user.id, user.name)}
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
              <div className="md:hidden space-y-3 px-3 sm:px-4 pb-4">
                {paginatedUsers.map((user) => (
                  <Card key={user.id} className="border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate mb-1">
                            {user.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                        </div>
                        <div className="ml-3">
                          {getRoleBadge(user.role)}
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-3 text-sm">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-500 w-24">No. Telepon:</span>
                          <span>{user.phone || "-"}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-500 w-24">Terdaftar:</span>
                          <span>{new Date(user.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openEditDialog(user)}
                          className="flex-1 h-9 border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950"
                        >
                          <Edit className="h-3.5 w-3.5 mr-1.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(user.id, user.name)}
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
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {isEditMode ? "Edit User" : "Tambah User Baru"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode ? "Perbarui data user yang dipilih" : "Masukkan data user baru ke sistem"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nama Lengkap <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Masukkan nama lengkap"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="h-10"
                required
                disabled={isSubmitting}
              />
            </div>
            
            {!isEditMode && (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="h-10"
                  required
                  disabled={isSubmitting}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                No. Telepon
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="08xxxxxxxxxx"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="h-10"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password {isEditMode && <span className="text-gray-500 font-normal">(Kosongkan jika tidak diubah)</span>}
                {!isEditMode && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={isEditMode ? "Masukkan password baru" : "Minimal 6 karakter"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="h-10"
                required={!isEditMode}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">
                Role <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData({ ...formData, role: value })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Pilih role pengguna" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
                  <SelectItem value="BK">Guru BK</SelectItem>
                  <SelectItem value="WALIKELAS">Wali Kelas</SelectItem>
                  <SelectItem value="GURUMAPEL">Guru Mapel</SelectItem>
                  <SelectItem value="ORANGTUA">Orang Tua</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === "GURUMAPEL" && (
              <div className="space-y-2">
                <Label htmlFor="mapel" className="text-sm font-medium">
                  Mata Pelajaran
                </Label>
                <Input
                  id="mapel"
                  placeholder="Contoh: Matematika, Bahasa Indonesia"
                  value={formData.mapel}
                  onChange={(e) =>
                    setFormData({ ...formData, mapel: e.target.value })
                  }
                  className="h-10"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Informasi ini untuk identifikasi saja
                </p>
              </div>
            )}

            {formData.role === "ORANGTUA" && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong className="font-semibold">Catatan:</strong> Setelah membuat akun orang tua:
                </p>
                <ol className="text-sm text-yellow-800 dark:text-yellow-200 mt-1 ml-4 space-y-0.5 list-decimal">
                  <li>Masuk ke menu Data Siswa</li>
                  <li>Edit data siswa yang bersangkutan</li>
                  <li>Pilih orang tua ini di field "Orang Tua"</li>
                </ol>
              </div>
            )}

            {formData.role === "WALIKELAS" && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong className="font-semibold">Catatan:</strong> Setelah membuat akun wali kelas:
                </p>
                <ol className="text-sm text-blue-800 dark:text-blue-200 mt-1 ml-4 space-y-0.5 list-decimal">
                  <li>Masuk ke menu Data Siswa</li>
                  <li>Edit siswa yang menjadi tanggung jawabnya</li>
                  <li>Pilih wali kelas ini di field "Wali Kelas"</li>
                </ol>
              </div>
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
    </div>
  );
}