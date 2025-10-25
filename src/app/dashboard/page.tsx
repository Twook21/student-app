"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertTriangle, Trophy, GraduationCap } from "lucide-react";

interface DashboardStats {
  totalSiswa: number;
  totalPelanggaran: number;
  totalPrestasi: number;
  pelanggaranMenunggu: number;
  prestasiMenunggu: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalSiswa: 0,
    totalPelanggaran: 0,
    totalPrestasi: 0,
    pelanggaranMenunggu: 0,
    prestasiMenunggu: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect ORANGTUA & SISWA to profile page
    if (session?.user?.role === "ORANGTUA" || session?.user?.role === "SISWA") {
      router.push("/dashboard/profil-saya");
      return;
    }
    
    fetchDashboardStats();
  }, [session]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while redirecting for ORANGTUA
  if (session?.user?.role === "ORANGTUA") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Memuat...</p>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Siswa",
      value: stats.totalSiswa,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      roles: ["SUPERADMIN", "BK", "WALIKELAS"],
    },
    {
      title: "Total Pelanggaran",
      value: stats.totalPelanggaran,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      roles: ["SUPERADMIN", "BK", "WALIKELAS"],
    },
    {
      title: "Total Prestasi",
      value: stats.totalPrestasi,
      icon: Trophy,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      roles: ["SUPERADMIN", "BK", "WALIKELAS", "GURUMAPEL"],
    },
    {
      title: "Pelanggaran Menunggu",
      value: stats.pelanggaranMenunggu,
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      roles: ["BK"],
    },
    {
      title: "Prestasi Menunggu",
      value: stats.prestasiMenunggu,
      icon: Trophy,
      color: "text-green-600",
      bgColor: "bg-green-100",
      roles: ["BK"],
    },
  ];

  const filteredStats = statsCards.filter(
    (card) => session?.user?.role && card.roles.includes(session.user.role)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang, {session?.user?.name}
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Belum ada aktivitas terbaru
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Role:</span> {session?.user?.role}
              </p>
              <p>
                <span className="font-medium">Email:</span> {session?.user?.email}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}