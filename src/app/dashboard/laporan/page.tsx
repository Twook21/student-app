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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Search, Loader2, AlertCircle, ChevronLeft, ChevronRight, BarChart3, Users, AlertTriangle, Trophy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from "xlsx";

interface RekapSiswa {
  siswa: string;
  nis: string;
  kelas: string;
  pelanggaran: number;
  prestasi: number;
  totalPoin: number;
}

export default function LaporanPage() {
  const { toast } = useToast();
  const [rekapList, setRekapList] = useState<RekapSiswa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterKelas, setFilterKelas] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [kelasList, setKelasList] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchRekap();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterKelas, itemsPerPage]);

  const fetchRekap = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/laporan/rekap");
      if (response.ok) {
        const data: RekapSiswa[] = await response.json();
        setRekapList(data);
        
        // Extract unique kelas
        const uniqueKelas = Array.from(new Set(data.map((r: RekapSiswa) => r.kelas)));
        setKelasList(uniqueKelas.sort());
      } else {
        throw new Error("Failed to fetch rekap");
      }
    } catch (error) {
      console.error("Error fetching rekap:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data laporan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRekap = useMemo(() => {
    let filtered = rekapList;

    if (filterKelas) {
      filtered = filtered.filter((r) => r.kelas === filterKelas);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.siswa.toLowerCase().includes(query) ||
          r.nis.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, filterKelas, rekapList]);

  // Pagination
  const totalPages = Math.ceil(filteredRekap.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRekap = filteredRekap.slice(startIndex, endIndex);

  const totalStats = useMemo(() => ({
    totalSiswa: filteredRekap.length,
    totalPelanggaran: filteredRekap.reduce((sum, r) => sum + r.pelanggaran, 0),
    totalPrestasi: filteredRekap.reduce((sum, r) => sum + r.prestasi, 0),
    avgPoin: filteredRekap.length > 0
      ? (filteredRekap.reduce((sum, r) => sum + r.totalPoin, 0) / filteredRekap.length).toFixed(1)
      : "0",
  }), [filteredRekap]);

  const exportToExcel = () => {
    try {
      setIsExporting(true);

      // Prepare data for export
      const exportData = filteredRekap.map((r) => ({
        "NIS": r.nis,
        "Nama Siswa": r.siswa,
        "Kelas": r.kelas,
        "Total Pelanggaran": r.pelanggaran,
        "Total Prestasi": r.prestasi,
        "Total Poin": r.totalPoin,
      }));

      // Add summary row
      exportData.push({
        "NIS": "",
        "Nama Siswa": "TOTAL",
        "Kelas": "",
        "Total Pelanggaran": totalStats.totalPelanggaran,
        "Total Prestasi": totalStats.totalPrestasi,
        "Total Poin": `Rata-rata: ${totalStats.avgPoin}`,
      } as any);

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      ws['!cols'] = [
        { wch: 15 }, // NIS
        { wch: 30 }, // Nama Siswa
        { wch: 15 }, // Kelas
        { wch: 18 }, // Total Pelanggaran
        { wch: 15 }, // Total Prestasi
        { wch: 12 }, // Total Poin
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Rekap Poin Siswa");

      // Add info sheet
      const infoData = [
        { "Informasi": "Tanggal Export", "Nilai": new Date().toLocaleString("id-ID") },
        { "Informasi": "Total Siswa", "Nilai": totalStats.totalSiswa },
        { "Informasi": "Total Pelanggaran", "Nilai": totalStats.totalPelanggaran },
        { "Informasi": "Total Prestasi", "Nilai": totalStats.totalPrestasi },
        { "Informasi": "Rata-rata Poin", "Nilai": totalStats.avgPoin },
        { "Informasi": "Filter Kelas", "Nilai": filterKelas || "Semua Kelas" },
      ];
      const wsInfo = XLSX.utils.json_to_sheet(infoData);
      wsInfo['!cols'] = [{ wch: 20 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(wb, wsInfo, "Informasi");

      // Generate filename
      const filename = `Laporan_Poin_Siswa_${filterKelas || "Semua"}_${new Date().getTime()}.xlsx`;

      // Download
      XLSX.writeFile(wb, filename);

      toast({
        title: "Berhasil",
        description: "Laporan berhasil diexport ke Excel",
      });
    } catch (error) {
      console.error("Error exporting:", error);
      toast({
        title: "Error",
        description: "Gagal export laporan",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
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
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50">
                Laporan
              </h1>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">
            Rekap poin siswa dan statistik
          </p>
        </div>
        <Button 
          onClick={exportToExcel} 
          disabled={filteredRekap.length === 0 || isExporting}
          className="w-full sm:w-auto shadow-sm"
          size="default"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
              <span className="sm:inline">Exporting...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="sm:inline">Export Excel</span>
            </>
          )}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Siswa
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">
              {totalStats.totalSiswa}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Siswa terdaftar
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
              Pelanggaran
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
              {totalStats.totalPelanggaran}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Total kasus
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
              Prestasi
            </CardTitle>
            <Trophy className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
              {totalStats.totalPrestasi}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Total pencapaian
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
              Rata-rata
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-50">
              {totalStats.avgPoin}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Poin per siswa
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
        <CardHeader className="space-y-0 pb-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder="Cari nama atau NIS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800"
                />
              </div>
              <Select 
                value={filterKelas === "" ? "all" : filterKelas} 
                onValueChange={(val) => setFilterKelas(val === "all" ? "" : val)}
              >
                <SelectTrigger className="w-full sm:w-48 h-10">
                  <SelectValue placeholder="Semua Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {kelasList.map((kelas) => (
                    <SelectItem key={kelas} value={kelas}>
                      {kelas}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {filteredRekap.length > 0 && (
              <div className="flex items-center gap-3 justify-end">
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
                  {startIndex + 1}-{Math.min(endIndex, filteredRekap.length)} dari {filteredRekap.length}
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <Loader2 className="h-8 w-8 animate-spin mb-3 text-blue-600 dark:text-blue-400" />
              <p className="text-sm">Memuat data...</p>
            </div>
          ) : filteredRekap.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <AlertCircle className="h-12 w-12 mb-3 text-gray-300 dark:text-gray-700" />
              <p className="text-sm font-medium">
                {searchQuery || filterKelas ? "Tidak ada hasil yang ditemukan" : "Belum ada data laporan"}
              </p>
              {(searchQuery || filterKelas) && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Coba ubah filter atau kata kunci
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
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">NIS</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Nama</TableHead>
                      <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Kelas</TableHead>
                      <TableHead className="text-center font-semibold text-gray-700 dark:text-gray-300">Pelanggaran</TableHead>
                      <TableHead className="text-center font-semibold text-gray-700 dark:text-gray-300">Prestasi</TableHead>
                      <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">Total Poin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRekap.map((rekap, idx) => (
                      <TableRow key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                        <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                          {rekap.nis}
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-gray-100">
                          {rekap.siswa}
                        </TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">
                          {rekap.kelas}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant="outline" 
                            className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border-0 font-medium"
                          >
                            {rekap.pelanggaran}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant="outline" 
                            className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-0 font-medium"
                          >
                            {rekap.prestasi}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-semibold ${
                              rekap.totalPoin < 0
                                ? "text-red-600 dark:text-red-400"
                                : "text-green-600 dark:text-green-400"
                            }`}
                          >
                            {rekap.totalPoin}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile/Tablet Card List */}
              <div className="lg:hidden space-y-3 px-3 sm:px-4 pb-4">
                {paginatedRekap.map((rekap, idx) => (
                  <Card key={idx} className="border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {rekap.siswa}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            NIS: {rekap.nis} • {rekap.kelas}
                          </p>
                        </div>
                        <div className="ml-3 text-right">
                          <div className={`text-lg font-bold ${
                            rekap.totalPoin < 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-green-600 dark:text-green-400"
                          }`}>
                            {rekap.totalPoin}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">poin</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className="bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border-0 font-medium text-xs"
                          >
                            {rekap.pelanggaran} Pelanggaran
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-0 font-medium text-xs"
                          >
                            {rekap.prestasi} Prestasi
                          </Badge>
                        </div>
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
    </div>
  );
}