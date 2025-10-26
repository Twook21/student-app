"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, Mail, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau password salah");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 font-sans">
        {/* Header - Same as Landing Page */}
        <header className="sticky top-0 z-50 w-full py-3 px-4 sm:py-4 sm:px-6 md:px-12 flex justify-between items-center bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b dark:border-gray-800 shadow-sm">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/logo_smaber.png"
              alt="Logo SMAN 1 Berbek"
              width={36}
              height={36}
              className="w-8 h-8 sm:w-10 sm:h-10"
            />
            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-50 hidden xs:block">
              SMAN 1 Berbek
            </span>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Kembali</span>
              </Button>
            </Link>
            <div className="scale-90 sm:scale-100">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex items-center justify-center py-8 px-4 sm:py-12 md:py-20">
          <div className="w-full max-w-md">
            {/* Logo & Title Section */}
            <div className="text-center mb-8 space-y-4 animate-slide-up">
              <div className="inline-flex items-center justify-center mb-4">
                <Image
                  src="/images/logo_smaber.png"
                  alt="Logo SMAN 1 Berbek"
                  width={64}
                  height={64}
                  className="w-16 h-16"
                />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-2">
                  Sistem Poin Siswa
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                  Platform terpadu untuk pemantauan karakter siswa
                </p>
              </div>
            </div>

            {/* Login Card */}
            <Card className="shadow-xl border dark:border-gray-800 dark:bg-gray-900/50 backdrop-blur-sm animate-slide-up staggered-1">
              <CardHeader className="space-y-1 pb-4 text-center">
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                  Masuk ke Akun
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Masukkan kredensial Anda untuk melanjutkan
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <Alert variant="destructive" className="animate-slide-down">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="nama@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="pl-10 h-11 border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-950"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                        className="pl-10 pr-10 h-11 border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-950"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors"
                    >
                      Lupa password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold shadow-md transition-all duration-200 rounded-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        Masuk
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Footer Text */}
            <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-8">
              © 2025 SMAN 1 Berbek. Semua hak dilindungi.
            </p>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}