"use client";

import { useState } from "react";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Image from "next/image";

// Import semua section
import { HeroSection } from "@/components/landing/hero-section";
import { BenefitsSection } from "@/components/landing/benefitsSection";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { TestimonialsSection } from "@/components/landing/testimonialsSection";
import { FaqSection } from "@/components/landing/faqSection";
import { SecuritySection } from "@/components/landing/securitySection";
import { FinalCTASection } from "@/components/landing/finalCtaSection";
import { Footer } from "@/components/landing/footer";
import { useActiveSection } from "@/hooks/useActiveSection";
import { ScrollToTopButton } from "@/components/ui/scrollToTopButton";

export default function LandingPage() {
  const [isOpen, setIsOpen] = useState(false);
  const sectionIds = ["hero", "manfaat", "fitur", "cara-kerja", "testimoni", "faq", "security", "final-cta"];
  const activeSection = useActiveSection(sectionIds);

  const navLinks = [
    { id: "manfaat", label: "Manfaat" },
    { id: "fitur", label: "Fitur" },
    { id: "cara-kerja", label: "Cara Kerja" },
    { id: "faq", label: "FAQ" },
  ];

  const getLinkClass = (id: string) =>
    `font-medium transition-colors ${
      activeSection === id
        ? "text-blue-600 dark:text-blue-400"
        : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
    }`;

  const getMobileLinkClass = (id: string) =>
    `text-lg font-medium transition-colors ${
      activeSection === id
        ? "text-blue-600 dark:text-blue-400"
        : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
    }`;

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 font-sans">
        <header className="sticky top-0 z-50 w-full py-4 px-6 md:px-12 flex justify-between items-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b dark:border-gray-800">
          {/* Mengganti teks dengan logo */}
          <a href="#" className="flex items-center space-x-2">
            <Image
              src="/images/logo_smaber.png" // Ganti dengan path logo Anda
              alt="Logo SMAN 1 Berbek"
              width={40}
              height={40}
            />
            <span className="text-xl font-bold text-gray-900 dark:text-gray-50 hidden sm:block">SMAN 1 Berbek</span>
          </a>
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex space-x-8 text-sm">
              {navLinks.map((link) => (
                <a key={link.id} href={`#${link.id}`} className={getLinkClass(link.id)}>
                  {link.label}
                </a>
              ))}
            </nav>
            {/* Tombol Daftar dan Masuk untuk Desktop */}
            <div className="hidden md:flex space-x-2">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                Masuk
              </Button>
              <Button variant="outline" className="rounded-full">
                Daftar
              </Button>
            </div>
            <ThemeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-6 mt-8">
                  {navLinks.map((link) => (
                    <a key={link.id} onClick={() => setIsOpen(false)} href={`#${link.id}`} className={getMobileLinkClass(link.id)}>
                      {link.label}
                    </a>
                  ))}
                  {/* Tombol Daftar dan Masuk untuk Mobile */}
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                    Masuk
                  </Button>
                  <Button variant="outline" className="mt-4 rounded-full">
                    Daftar
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <main className="flex-grow">
          <section id="hero"><HeroSection /></section>
          <section id="manfaat"><BenefitsSection /></section>
          <section id="fitur"><FeaturesSection /></section>
          <section id="cara-kerja"><HowItWorksSection /></section>
          <section id="testimoni"><TestimonialsSection /></section>
          <section id="faq"><FaqSection /></section>
          <section id="security"><SecuritySection /></section>
          <section id="final-cta"><FinalCTASection /></section>
        </main>
        
        <Footer />
        <ScrollToTopButton />
      </div>
    </ThemeProvider>
  );
}