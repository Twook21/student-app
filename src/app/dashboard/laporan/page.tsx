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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
  const [filteredRekap, setFilteredRekap] = useState<RekapSiswa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterKelas, setFilterKelas] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [kelasList, setKelasList] = useState<string[]>([]);

  useEffect(() => {
    fetchRekap();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchQuery, filterKelas, rekapList]);

  const fetchRekap = async () => {
    try {
      const response = await fetch("/api/laporan/rekap");
      if (response.ok) {
        const data: RekapSiswa[] = await response.json();
        setRekapList(data);
        setFilteredRekap(data);
        
        // Extract unique kelas
        const uniqueKelas = Array.from(new Set(data.map((r: RekapSiswa) => r.kelas)));
        setKelasList(uniqueKelas);
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

  const filterData = () => {
    let filtered = rekapList;

    if (filterKelas) {
      filtered = filtered.filter((r) => r.kelas === filterKelas);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (r) =>
          r.siswa.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.nis.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredRekap(filtered);
  };

  const exportToCSV = () => {
    const headers = ["NIS", "Nama", "Kelas", "Pelanggaran", "Prestasi", "Total Poin"];
    const rows = filteredRekap.map((r) => [
      r.nis,
      r.siswa,
      r.kelas,
      r.pelanggaran,
      r.prestasi,
      r.totalPoin,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `laporan_poin_siswa_${new Date().getTime()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Berhasil",
      description: "Laporan berhasil diexport",
    });
  };

  const totalStats = {
    totalSiswa: filteredRekap.length,
    totalPelanggaran: filteredRekap.reduce((sum, r) => sum + r.pelanggaran, 0),
    totalPrestasi: filteredRekap.reduce((sum, r) => sum + r.prestasi, 0),
    avgPoin: filteredRekap.length > 0
      ? (filteredRekap.reduce((sum, r) => sum + r.totalPoin, 0) / filteredRekap.length).toFixed(1)
      : 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Laporan</h1>
          <p className="text-muted-foreground">
            Rekap poin siswa dan statistik
          </p>
        </div>
        <Button onClick={exportToCSV} disabled={filteredRekap.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalSiswa}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pelanggaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalStats.totalPelanggaran}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prestasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalStats.totalPrestasi}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Poin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.avgPoin}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau NIS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={filterKelas === "" ? "all" : filterKelas} onValueChange={(val) => setFilterKelas(val === "all" ? "" : val)}>
                <SelectTrigger>
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
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Memuat data...</div>
          ) : filteredRekap.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada data laporan
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>NIS</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead className="text-center">Pelanggaran</TableHead>
                    <TableHead className="text-center">Prestasi</TableHead>
                    <TableHead className="text-right">Total Poin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRekap.map((rekap, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{rekap.nis}</TableCell>
                      <TableCell>{rekap.siswa}</TableCell>
                      <TableCell>{rekap.kelas}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-red-100">
                          {rekap.pelanggaran}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-green-100">
                          {rekap.prestasi}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`font-semibold ${
                            rekap.totalPoin < 0
                              ? "text-red-600"
                              : "text-green-600"
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}