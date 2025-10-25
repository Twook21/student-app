"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

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

  useEffect(() => {
    fetchNotifikasi();
  }, []);

  const fetchNotifikasi = async () => {
    try {
      const response = await fetch("/api/notifikasi");
      if (response.ok) {
        const data = await response.json();
        setNotifikasiList(data);
      }
    } catch (error) {
      console.error("Error fetching notifikasi:", error);
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

  const unreadCount = notifikasiList.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifikasi</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} notifikasi belum dibaca`
              : "Semua notifikasi sudah dibaca"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} variant="outline">
            <CheckCheck className="mr-2 h-4 w-4" />
            Tandai Semua Sudah Dibaca
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center">
              Memuat notifikasi...
            </CardContent>
          </Card>
        ) : notifikasiList.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Tidak ada notifikasi</h3>
                <p className="text-sm text-muted-foreground">
                  Notifikasi akan muncul di sini
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          notifikasiList.map((notif) => (
            <Card
              key={notif.id}
              className={`cursor-pointer transition-colors ${
                !notif.isRead ? "bg-blue-50 border-blue-200" : ""
              }`}
              onClick={() => !notif.isRead && markAsRead(notif.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`p-2 rounded-lg ${
                        !notif.isRead ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      <Bell
                        className={`h-4 w-4 ${
                          !notif.isRead ? "text-blue-600" : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base">
                          {notif.title}
                        </CardTitle>
                        {!notif.isRead && (
                          <Badge variant="outline" className="bg-blue-100">
                            Baru
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {notif.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(notif.createdAt), "dd MMM yyyy, HH:mm", {
                          locale: idLocale,
                        })}
                      </p>
                    </div>
                  </div>
                  {!notif.isRead && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notif.id);
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}