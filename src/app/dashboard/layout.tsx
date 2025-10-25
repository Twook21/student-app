"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const filteredNavigation = navigation.filter(
    (item) => session?.user?.role && item.roles.includes(session.user.role)
  );

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {filteredNavigation.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => mobile && setIsOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r bg-background">
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-xl font-bold">Sistem Poin Siswa</h1>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <NavItems />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="mb-6">
                <h2 className="text-lg font-bold">Sistem Poin Siswa</h2>
              </div>
              <nav className="space-y-1">
                <NavItems mobile />
              </nav>
            </SheetContent>
          </Sheet>

          <div className="ml-auto flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline">{session?.user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{session?.user?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {session?.user?.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Role: {session?.user?.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}