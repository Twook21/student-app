"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trophy, Medal, Award, TrendingUp, Filter } from "lucide-react";

interface RankingSiswa {
  rank: number;
  nama: string;
  nis: string;
  kelas: string;
  totalPoin: number;
  pelanggaran: number;
  prestasi: number;
}

export default function RankingPage() {
  const [rankingList, setRankingList] = useState<RankingSiswa[]>([]);
  const [filteredRanking, setFilteredRanking] = useState<RankingSiswa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterKelas, setFilterKelas] = useState("");
  const [kelasList, setKelasList] = useState<string[]>([]);

  useEffect(() => {
    fetchRanking();
  }, []);

  useEffect(() => {
    filterData();
  }, [filterKelas, rankingList]);

  const fetchRanking = async () => {
    try {
      const response = await fetch("/api/ranking");
      if (response.ok) {
        const data = (await response.json()) as RankingSiswa[];
        setRankingList(data);
        setFilteredRanking(data);
        
        // Extract unique kelas
        const uniqueKelas = Array.from(new Set(data.map((r) => r.kelas)));
        setKelasList(uniqueKelas);
      }
    } catch (error) {
      console.error("Error fetching ranking:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterData = () => {
    if (!filterKelas) {
      setFilteredRanking(rankingList);
      return;
    }

    const filtered = rankingList.filter((r) => r.kelas === filterKelas);
    setFilteredRanking(filtered);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />;
      default:
        return <span className="text-base sm:text-lg font-bold text-gray-600 dark:text-gray-400">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500 hover:bg-yellow-500 text-xs">Juara 1</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400 hover:bg-gray-400 text-xs">Juara 2</Badge>;
    if (rank === 3) return <Badge className="bg-amber-600 hover:bg-amber-600 text-xs">Juara 3</Badge>;
    return null;
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50">
            Ranking Siswa
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Peringkat siswa berdasarkan total poin
          </p>
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={filterKelas === "" ? "all" : filterKelas}
            onValueChange={(val) => setFilterKelas(val === "all" ? "" : val)}
          >
            <SelectTrigger className="h-10">
              <Filter className="h-4 w-4 mr-2" />
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

      {/* Top 3 Cards */}
      {!isLoading && filteredRanking.length >= 3 && (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
          {/* Mobile: 1st Place First */}
          <Card className="border-yellow-400 dark:border-yellow-500 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 sm:order-2 sm:scale-105 sm:shadow-lg">
            <CardHeader className="text-center pb-2 sm:pb-3">
              <div className="flex justify-center mb-2">
                <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-500 dark:text-yellow-400" />
              </div>
              <Badge className="bg-yellow-500 hover:bg-yellow-500 mx-auto text-xs sm:text-sm">Juara 1</Badge>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <p className="font-bold text-base sm:text-xl text-gray-900 dark:text-gray-50 truncate px-2">
                {filteredRanking[0].nama}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                {filteredRanking[0].kelas}
              </p>
              <p className="text-3xl sm:text-4xl font-bold text-yellow-600 dark:text-yellow-400 mt-2 sm:mt-3">
                {filteredRanking[0].totalPoin}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">poin</p>
            </CardContent>
          </Card>

          {/* 2nd Place */}
          <Card className="border-gray-300 dark:border-gray-700 sm:order-1">
            <CardHeader className="text-center pb-2 sm:pb-3">
              <div className="flex justify-center mb-2">
                <Medal className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500" />
              </div>
              <Badge className="bg-gray-400 hover:bg-gray-400 mx-auto text-xs sm:text-sm">Juara 2</Badge>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <p className="font-bold text-sm sm:text-lg text-gray-900 dark:text-gray-50 truncate px-2">
                {filteredRanking[1].nama}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                {filteredRanking[1].kelas}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-600 dark:text-gray-400 mt-2">
                {filteredRanking[1].totalPoin}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">poin</p>
            </CardContent>
          </Card>

          {/* 3rd Place */}
          <Card className="border-amber-300 dark:border-amber-700 sm:order-3">
            <CardHeader className="text-center pb-2 sm:pb-3">
              <div className="flex justify-center mb-2">
                <Award className="h-10 w-10 sm:h-12 sm:w-12 text-amber-600 dark:text-amber-500" />
              </div>
              <Badge className="bg-amber-600 hover:bg-amber-600 mx-auto text-xs sm:text-sm">Juara 3</Badge>
            </CardHeader>
            <CardContent className="text-center pt-2">
              <p className="font-bold text-sm sm:text-lg text-gray-900 dark:text-gray-50 truncate px-2">
                {filteredRanking[2].nama}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                {filteredRanking[2].kelas}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-500 mt-2">
                {filteredRanking[2].totalPoin}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">poin</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Full Ranking List */}
      <Card className="border dark:border-gray-800">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-gray-900 dark:text-gray-50">
            <TrendingUp className="h-5 w-5" />
            Peringkat Lengkap
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Memuat data...</p>
            </div>
          ) : filteredRanking.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Tidak ada data ranking
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {filteredRanking.map((siswa) => (
                <div
                  key={siswa.nis}
                  className={`flex items-start sm:items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg border dark:border-gray-800 transition-all hover:shadow-md ${
                    siswa.rank <= 3 
                      ? "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900/50 border-gray-300 dark:border-gray-700" 
                      : "bg-white dark:bg-gray-900/50"
                  }`}
                >
                  {/* Rank Icon */}
                  <div className="flex items-center justify-center w-10 sm:w-12 flex-shrink-0">
                    {getRankIcon(siswa.rank)}
                  </div>

                  {/* Student Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                      <p className="font-semibold text-sm sm:text-base text-gray-900 dark:text-gray-50 truncate">
                        {siswa.nama}
                      </p>
                      {getRankBadge(siswa.rank)}
                    </div>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <span className="truncate">{siswa.nis}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="truncate">{siswa.kelas}</span>
                    </div>

                    {/* Mobile: Show stats below */}
                    <div className="flex items-center gap-2 mt-2 sm:hidden">
                      <Badge variant="outline" className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 text-xs border-red-200 dark:border-red-900">
                        {siswa.pelanggaran} Pelanggaran
                      </Badge>
                      <Badge variant="outline" className="bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400 text-xs border-green-200 dark:border-green-900">
                        {siswa.prestasi} Prestasi
                      </Badge>
                    </div>
                  </div>

                  {/* Points - Always visible */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                      {siswa.totalPoin}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">poin</p>
                  </div>

                  {/* Desktop: Stats on the right */}
                  <div className="hidden sm:flex flex-col gap-1.5 text-right flex-shrink-0">
                    <Badge variant="outline" className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 text-xs border-red-200 dark:border-red-900">
                      {siswa.pelanggaran} Pelanggaran
                    </Badge>
                    <Badge variant="outline" className="bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-400 text-xs border-green-200 dark:border-green-900">
                      {siswa.prestasi} Prestasi
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}