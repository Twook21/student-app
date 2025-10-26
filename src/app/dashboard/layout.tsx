"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  AlertTriangle,
  Trophy,
  FolderKanban,
  FileText,
  Bell,
  Menu,
  LogOut,
  User,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["SUPERADMIN", "BK", "WALIKELAS", "GURUMAPEL"] },
  { name: "Profil Saya", href: "/dashboard/profil-saya", icon: User, roles: ["SISWA", "ORANGTUA"] },
  { name: "Ranking", href: "/dashboard/ranking", icon: Trophy, roles: ["SUPERADMIN", "BK", "WALIKELAS", "SISWA"] },
  { name: "Data User", href: "/dashboard/users", icon: Users, roles: ["SUPERADMIN", "BK"] },
  { name: "Data Siswa", href: "/dashboard/siswa", icon: GraduationCap, roles: ["SUPERADMIN", "BK", "WALIKELAS"] },
  { name: "Pelanggaran", href: "/dashboard/pelanggaran", icon: AlertTriangle, roles: ["SUPERADMIN", "BK", "WALIKELAS"] },
  { name: "Prestasi", href: "/dashboard/prestasi", icon: Trophy, roles: ["SUPERADMIN", "BK", "WALIKELAS", "GURUMAPEL"] },
  { name: "Kategori", href: "/dashboard/kategori", icon: FolderKanban, roles: ["SUPERADMIN", "BK"] },
  { name: "Laporan", href: "/dashboard/laporan", icon: FileText, roles: ["SUPERADMIN", "BK", "WALIKELAS"] },
  { name: "Notifikasi", href: "/dashboard/notifikasi", icon: Bell, roles: ["SUPERADMIN", "BK", "WALIKELAS", "GURUMAPEL", "ORANGTUA", "SISWA"] },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    fetchUnreadNotifications();
    
    // Listen for notification updates
    const handleNotificationUpdate = () => {
      fetchUnreadNotifications();
    };
    
    window.addEventListener("notificationRead", handleNotificationUpdate);
    
    return () => {
      window.removeEventListener("notificationRead", handleNotificationUpdate);
    };
  }, []);

  const fetchUnreadNotifications = async () => {
    try {
      const response = await fetch("/api/notifikasi/unread-count");
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const filteredNavigation = navigation.filter(
    (item) => session?.user?.role && item.roles.includes(session.user.role)
  );

  const NavItems = ({ mobile = false, minimized = false }: { mobile?: boolean; minimized?: boolean }) => (
    <>
      {filteredNavigation.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        const isNotification = item.href === "/dashboard/notifikasi";
        
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => mobile && setIsOpen(false)}
            className={`flex items-center ${minimized ? 'justify-center' : 'gap-3'} rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative group ${
              isActive
                ? "bg-blue-600 text-white shadow-md dark:bg-blue-500"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
            title={minimized ? item.name : undefined}
          >
            <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
            {!minimized && <span className="truncate">{item.name}</span>}
            {!minimized && isNotification && unreadCount > 0 && (
              <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
            {minimized && isNotification && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar Desktop */}
      <aside className={`hidden lg:flex lg:flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-300 ${
        isMinimized ? 'lg:w-20' : 'lg:w-64'
      }`}>
        <div className="flex h-16 items-center gap-3 border-b border-gray-200 dark:border-gray-800 px-4">
          <Image
            src="/images/logo_smaber.png"
            alt="Logo SMAN 1 Berbek"
            width={36}
            height={36}
            className="w-8 h-8 flex-shrink-0"
          />
          {!isMinimized && (
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-base font-bold text-gray-900 dark:text-gray-50 truncate">
                Sistem Poin Siswa
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                SMAN 1 Berbek
              </p>
            </div>
          )}
        </div>
        
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <NavItems minimized={isMinimized} />
        </nav>
        
        {/* Minimize Toggle Button */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(!isMinimized)}
            className={`w-full ${isMinimized ? 'justify-center px-0' : 'justify-between'} hover:bg-gray-100 dark:hover:bg-gray-800`}
          >
            {!isMinimized && <span className="text-xs text-gray-600 dark:text-gray-400">Perkecil Sidebar</span>}
            {isMinimized ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        
        {/* User Info in Sidebar */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-3">
          <div className={`flex items-center gap-3 px-2 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 ${
            isMinimized ? 'justify-center' : ''
          }`}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-semibold text-sm flex-shrink-0">
              {session?.user?.name?.charAt(0).toUpperCase()}
            </div>
            {!isMinimized && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {session?.user?.role}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-14 sm:h-16 items-center gap-3 sm:gap-4 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-3 sm:px-4 lg:px-6 shadow-sm">
          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden flex-shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="flex h-16 items-center gap-3 border-b border-gray-200 dark:border-gray-800 px-4">
                <Image
                  src="/images/logo_smaber.png"
                  alt="Logo SMAN 1 Berbek"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-gray-50">
                    Sistem Poin Siswa
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    SMAN 1 Berbek
                  </p>
                </div>
              </div>
              <nav className="space-y-1 p-3 pb-20">
                <NavItems mobile />
              </nav>
              
              {/* User Info in Mobile Menu */}
              <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 p-3 bg-white dark:bg-gray-900">
                <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                    {session?.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {session?.user?.role}
                    </p>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo for Mobile/Tablet (when sidebar hidden) */}
          <div className="flex items-center gap-2 lg:hidden flex-1 min-w-0">
            <Image
              src="/images/logo_smaber.png"
              alt="Logo SMAN 1 Berbek"
              width={28}
              height={28}
              className="w-7 h-7 flex-shrink-0"
            />
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-50 truncate">
                Sistem Poin Siswa
              </h1>
            </div>
          </div>

          {/* User Dropdown - Desktop/Tablet */}
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="gap-2 px-2 sm:px-3 h-9 sm:h-10 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-semibold text-xs sm:text-sm">
                    {session?.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline text-sm font-medium text-gray-900 dark:text-gray-50 max-w-[120px] truncate">
                    {session?.user?.name}
                  </span>
                  <ChevronDown className="hidden md:block h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {session?.user?.email}
                    </p>
                    <div className="mt-1 inline-flex items-center">
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded">
                        {session?.user?.role}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-3 sm:p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}