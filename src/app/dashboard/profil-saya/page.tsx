"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User, AlertTriangle, Trophy, Award, MessageSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface SiswaProfile {
  id: string;
  nama: string;
  nis: string;
  kelas: string;
  totalPoin: number;
  waliKelas?: { name: string };
  orangTua?: { name: string; email: string };
}

interface Pelanggaran {
  id: string;
  kategori: { nama: string };
  deskripsi: string;
  poin: number;
  status: string;
  tanggal: string;
  alasanSiswa?: string;
  catatanBK?: string;
}

interface Prestasi {
  id: string;
  kategori: { nama: string };
  deskripsi: string;
  poin: number;
  status: string;
  tanggal: string;
}

export default function ProfilSayaPage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<SiswaProfile | null>(null);
  const [pelanggaran, setPelanggaran] = useState<Pelanggaran[]>([]);
  const [prestasi, setPrestasi] = useState<Prestasi[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/siswa/profil");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.siswa);
        setPelanggaran(data.pelanggaran);
        setPrestasi(data.prestasi);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Memuat data...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Data tidak ditemukan</p>
      </div>
    );
  }

  const pelanggaranDisetujui = pelanggaran.filter((p) => p.status === "DISETUJUI");
  const prestasiDisetujui = prestasi.filter((p) => p.status === "DISETUJUI");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profil Saya</h1>
        <p className="text-muted-foreground">
          Informasi lengkap tentang poin dan prestasi Anda
        </p>
      </div>

      {/* Profile Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Pribadi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Nama</p>
              <p className="font-medium">{profile.nama}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">NIS</p>
              <p className="font-medium">{profile.nis}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kelas</p>
              <p className="font-medium">{profile.kelas}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Wali Kelas</p>
              <p className="font-medium">{profile.waliKelas?.name || "-"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Ringkasan Poin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Total Pelanggaran</p>
                <p className="text-2xl font-bold text-red-600">
                  {pelanggaranDisetujui.length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Total Prestasi</p>
                <p className="text-2xl font-bold text-green-600">
                  {prestasiDisetujui.length}
                </p>
              </div>
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Total Poin</p>
                <p className={`text-3xl font-bold ${
                  profile.totalPoin < 0 ? "text-red-600" : "text-green-600"
                }`}>
                  {profile.totalPoin}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Riwayat */}
      <Tabs defaultValue="pelanggaran" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pelanggaran">
            Riwayat Pelanggaran ({pelanggaran.length})
          </TabsTrigger>
          <TabsTrigger value="prestasi">
            Riwayat Prestasi ({prestasi.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pelanggaran">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Pelanggaran</CardTitle>
            </CardHeader>
            <CardContent>
              {pelanggaran.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Tidak ada pelanggaran
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead className="text-right">Poin</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pelanggaran.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            {format(new Date(p.tanggal), "dd MMM yyyy", {
                              locale: idLocale,
                            })}
                          </TableCell>
                          <TableCell>{p.kategori.nama}</TableCell>
                          <TableCell>{p.deskripsi}</TableCell>
                          <TableCell className="text-right font-semibold text-red-600">
                            -{p.poin}
                          </TableCell>
                          <TableCell>{getStatusBadge(p.status)}</TableCell>
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
              <CardTitle>Riwayat Prestasi</CardTitle>
            </CardHeader>
            <CardContent>
              {prestasi.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Belum ada prestasi
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead className="text-right">Poin</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prestasi.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            {format(new Date(p.tanggal), "dd MMM yyyy", {
                              locale: idLocale,
                            })}
                          </TableCell>
                          <TableCell>{p.kategori.nama}</TableCell>
                          <TableCell>{p.deskripsi}</TableCell>
                          <TableCell className="text-right font-semibold text-green-600">
                            +{p.poin}
                          </TableCell>
                          <TableCell>{getStatusBadge(p.status)}</TableCell>
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