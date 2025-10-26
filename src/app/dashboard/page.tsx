"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertTriangle, Trophy, GraduationCap, Activity, Info } from "lucide-react";

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

  // Show loading while redirecting for ORANGTUA & SISWA
  if (session?.user?.role === "ORANGTUA" || session?.user?.role === "SISWA") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Memuat...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Siswa",
      value: stats.totalSiswa,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
      roles: ["SUPERADMIN", "BK", "WALIKELAS"],
    },
    {
      title: "Total Pelanggaran",
      value: stats.totalPelanggaran,
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/50",
      roles: ["SUPERADMIN", "BK", "WALIKELAS"],
    },
    {
      title: "Total Prestasi",
      value: stats.totalPrestasi,
      icon: Trophy,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/50",
      roles: ["SUPERADMIN", "BK", "WALIKELAS", "GURUMAPEL"],
    },
    {
      title: "Pelanggaran Menunggu",
      value: stats.pelanggaranMenunggu,
      icon: AlertTriangle,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/50",
      roles: ["BK"],
    },
    {
      title: "Prestasi Menunggu",
      value: stats.prestasiMenunggu,
      icon: Trophy,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/50",
      roles: ["BK"],
    },
  ];

  const filteredStats = statsCards.filter(
    (card) => session?.user?.role && card.roles.includes(session.user.role)
  );

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      {/* Header Section */}
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Selamat datang, <span className="font-medium text-gray-900 dark:text-gray-50">{session?.user?.name}</span>
        </p>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse border dark:border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={stat.title} 
                className="border dark:border-gray-800 hover:shadow-md transition-shadow duration-200"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 sm:p-2.5 rounded-lg ${stat.bgColor} transition-colors`}>
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="pt-1">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50">
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Bottom Info Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Activity Card */}
        <Card className="border dark:border-gray-800">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-50 dark:bg-purple-950/50 rounded-lg">
                <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-50">
                Aktivitas Terbaru
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-center py-6 sm:py-8">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center">
                Belum ada aktivitas terbaru
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border dark:border-gray-800">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg">
                <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-50">
                Informasi Akun
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[80px]">
                  Role:
                </span>
                <span className="text-xs sm:text-sm text-gray-900 dark:text-gray-50 font-semibold px-2 py-1 bg-blue-50 dark:bg-blue-950/50 rounded inline-block w-fit">
                  {session?.user?.role}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[80px]">
                  Email:
                </span>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-all">
                  {session?.user?.email}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}