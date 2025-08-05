"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative w-full py-20 md:py-32 flex items-center justify-center overflow-hidden bg-white dark:bg-gray-950">
      {/* Latar Belakang Gambar di Sisi Kanan */}
      <div className="absolute top-0 right-0 h-full w-full lg:w-1/2 pointer-events-none overflow-hidden">
        {/* Layer Gradient untuk Efek Memudar */}
        <div className="absolute top-0 left-0 h-full w-90 bg-gradient-to-r from-white dark:from-gray-950 to-transparent z-10"></div>
        <Image
          src="/images/front_bg-scaled.jpeg"
          alt="Ilustrasi sistem pembinaan karakter siswa"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover opacity-90 dark:opacity-70"
        />
      </div>
      <div className="container mx-auto px-4 md:px-6 flex flex-col lg:flex-row items-center justify-between gap-12 z-20 text-center lg:text-left">
        <div className="lg:w-1/2 animate-slide-up">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 text-gray-900 dark:text-gray-50">
            Sistem{" "}
            <span className="text-blue-600 dark:text-blue-400">
              Pembinaan Karakter
            </span>{" "}
            Siswa{" "}
            <span className="text-blue-600 dark:text-blue-400">
              SMAN 1 Berbek
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto lg:mx-0">
            Catat, pantau, dan tingkatkan prestasi serta disiplin siswa secara real-time.
          </p>
          <Button size="lg" className="text-lg px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors">
            Masuk ke Sistem
          </Button>
        </div>
        <div className="lg:w-1/2 flex justify-center lg:justify-end"></div>
      </div>
    </section>
  );
}