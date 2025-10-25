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
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";

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
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500">Juara 1</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400">Juara 2</Badge>;
    if (rank === 3) return <Badge className="bg-amber-600">Juara 3</Badge>;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ranking Siswa</h1>
          <p className="text-muted-foreground">
            Peringkat siswa berdasarkan total poin
          </p>
        </div>
        <div className="w-48">
          <Select
            value={filterKelas === "" ? "all" : filterKelas}
            onValueChange={(val) => setFilterKelas(val === "all" ? "" : val)}
          >
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

      {/* Top 3 Cards */}
      {!isLoading && filteredRanking.length >= 3 && (
        <div className="grid gap-4 md:grid-cols-3">
          {/* 2nd Place */}
          <Card className="border-gray-300">
            <CardHeader className="text-center pb-3">
              <div className="flex justify-center mb-2">
                <Medal className="h-12 w-12 text-gray-400" />
              </div>
              <Badge className="bg-gray-400 mx-auto">Juara 2</Badge>
            </CardHeader>
            <CardContent className="text-center">
              <p className="font-bold text-lg">{filteredRanking[1].nama}</p>
              <p className="text-sm text-muted-foreground">{filteredRanking[1].kelas}</p>
              <p className="text-3xl font-bold text-gray-600 mt-2">
                {filteredRanking[1].totalPoin}
              </p>
              <p className="text-xs text-muted-foreground">poin</p>
            </CardContent>
          </Card>

          {/* 1st Place */}
          <Card className="border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50 md:-mt-4">
            <CardHeader className="text-center pb-3">
              <div className="flex justify-center mb-2">
                <Trophy className="h-16 w-16 text-yellow-500" />
              </div>
              <Badge className="bg-yellow-500 mx-auto">Juara 1</Badge>
            </CardHeader>
            <CardContent className="text-center">
              <p className="font-bold text-xl">{filteredRanking[0].nama}</p>
              <p className="text-sm text-muted-foreground">{filteredRanking[0].kelas}</p>
              <p className="text-4xl font-bold text-yellow-600 mt-2">
                {filteredRanking[0].totalPoin}
              </p>
              <p className="text-xs text-muted-foreground">poin</p>
            </CardContent>
          </Card>

          {/* 3rd Place */}
          <Card className="border-amber-300">
            <CardHeader className="text-center pb-3">
              <div className="flex justify-center mb-2">
                <Award className="h-12 w-12 text-amber-600" />
              </div>
              <Badge className="bg-amber-600 mx-auto">Juara 3</Badge>
            </CardHeader>
            <CardContent className="text-center">
              <p className="font-bold text-lg">{filteredRanking[2].nama}</p>
              <p className="text-sm text-muted-foreground">{filteredRanking[2].kelas}</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">
                {filteredRanking[2].totalPoin}
              </p>
              <p className="text-xs text-muted-foreground">poin</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Full Ranking List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Peringkat Lengkap
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Memuat data...</div>
          ) : filteredRanking.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada data ranking
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRanking.map((siswa) => (
                <div
                  key={siswa.nis}
                  className={`flex items-center gap-4 p-4 rounded-lg border ${
                    siswa.rank <= 3 ? "bg-gradient-to-r from-gray-50 to-white" : ""
                  }`}
                >
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(siswa.rank)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{siswa.nama}</p>
                      {getRankBadge(siswa.rank)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{siswa.nis}</span>
                      <span>•</span>
                      <span>{siswa.kelas}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {siswa.totalPoin}
                    </p>
                    <p className="text-xs text-muted-foreground">poin</p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-red-50 text-xs">
                        {siswa.pelanggaran} Pelanggaran
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-xs">
                        {siswa.prestasi} Prestasi
                      </Badge>
                    </div>
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