"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Check, CheckCheck, Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";


interface Notifikasi {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotifikasiPage() {
  const { toast } = useToast();
  const [notifikasiList, setNotifikasiList] = useState<Notifikasi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchNotifikasi();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const fetchNotifikasi = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/notifikasi");
      if (response.ok) {
        const data = await response.json();
        setNotifikasiList(data);
      } else {
        throw new Error("Failed to fetch notifikasi");
      }
    } catch (error) {
      console.error("Error fetching notifikasi:", error);
      toast({
        title: "Error",
        description: "Gagal memuat notifikasi",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifikasi/${id}/read`, {
        method: "PUT",
      });

      if (response.ok) {
        fetchNotifikasi();
        // Trigger refresh in layout
        window.dispatchEvent(new Event("notificationRead"));
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifikasi/read-all", {
        method: "PUT",
      });

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Semua notifikasi ditandai sudah dibaca",
        });
        fetchNotifikasi();
        // Trigger refresh in layout
        window.dispatchEvent(new Event("notificationRead"));
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan",
        variant: "destructive",
      });
    }
  };

  const filteredNotifikasi = useMemo(() => {
    if (activeTab === "unread") {
      return notifikasiList.filter((n) => !n.isRead);
    } else if (activeTab === "read") {
      return notifikasiList.filter((n) => n.isRead);
    }
    return notifikasiList;
  }, [notifikasiList, activeTab]);

  // Pagination
  const totalPages = Math.ceil(filteredNotifikasi.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNotifikasi = filteredNotifikasi.slice(startIndex, endIndex);

  const unreadCount = notifikasiList.filter((n) => !n.isRead).length;
  const readCount = notifikasiList.filter((n) => n.isRead).length;

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

  const renderNotifikasiList = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin mb-3 text-blue-600 dark:text-blue-400" />
          <p className="text-sm">Memuat notifikasi...</p>
        </div>
      );
    }

    if (filteredNotifikasi.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
          <Bell className="h-12 w-12 mb-3 text-gray-300 dark:text-gray-700" />
          <p className="text-sm font-medium">
            {activeTab === "unread" 
              ? "Tidak ada notifikasi belum dibaca" 
              : activeTab === "read"
              ? "Tidak ada notifikasi yang sudah dibaca"
              : "Belum ada notifikasi"}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Notifikasi akan muncul di sini
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="space-y-3">
          {paginatedNotifikasi.map((notif) => (
            <Card
              key={notif.id}
              className={`cursor-pointer transition-all duration-200 border-gray-200 dark:border-gray-800 hover:shadow-md ${
                !notif.isRead 
                  ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900" 
                  : "hover:bg-gray-50 dark:hover:bg-gray-900/30"
              }`}
              onClick={() => !notif.isRead && markAsRead(notif.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg flex-shrink-0 ${
                      !notif.isRead 
                        ? "bg-blue-100 dark:bg-blue-900/50" 
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}
                  >
                    <Bell
                      className={`h-4 w-4 ${
                        !notif.isRead 
                          ? "text-blue-600 dark:text-blue-400" 
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base text-gray-900 dark:text-gray-50">
                          {notif.title}
                        </CardTitle>
                        {!notif.isRead && (
                          <Badge 
                            variant="secondary" 
                            className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-0 text-xs"
                          >
                            Baru
                          </Badge>
                        )}
                      </div>
                      {!notif.isRead && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notif.id);
                          }}
                          className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-950 dark:hover:text-blue-400 flex-shrink-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 break-words">
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {new Date(notif.createdAt).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-800 mt-4">
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
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50">
                Notifikasi
              </h1>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-11">
            {unreadCount > 0
              ? `${unreadCount} notifikasi belum dibaca`
              : "Semua notifikasi sudah dibaca"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button 
            onClick={markAllAsRead} 
            variant="outline"
            className="w-full sm:w-auto"
            size="default"
          >
            <CheckCheck className="h-4 w-4 sm:mr-2" />
            <span className="sm:inline">Tandai Semua Dibaca</span>
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="all" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/50 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300">
            <span className="text-sm sm:text-base">Semua</span>
            <Badge 
              variant="secondary" 
              className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            >
              {notifikasiList.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unread" className="data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900/50 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300">
            <span className="text-sm sm:text-base">Belum Dibaca</span>
            <Badge 
              variant="secondary" 
              className="ml-2 bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200"
            >
              {unreadCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="read" className="data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800 data-[state=active]:text-gray-700 dark:data-[state=active]:text-gray-300">
            <span className="text-sm sm:text-base">Dibaca</span>
            <Badge 
              variant="secondary" 
              className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            >
              {readCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-3 sm:p-6">
              {renderNotifikasiList()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread" className="mt-4">
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-3 sm:p-6">
              {renderNotifikasiList()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="read" className="mt-4">
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
            <CardContent className="p-3 sm:p-6">
              {renderNotifikasiList()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}