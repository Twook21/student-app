"use client";

import { useState } from "react";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
  const sectionIds = [
    "hero",
    "manfaat",
    "fitur",
    "cara-kerja",
    "testimoni",
    "faq",
    "security",
    "final-cta",
  ];
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
    `text-base font-medium transition-colors block ${
      activeSection === id
        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950"
        : "text-gray-700 dark:text-gray-300"
    }`;

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 font-sans">
        {/* Header - Optimized for Mobile */}
        <header className="sticky top-0 z-50 w-full py-3 px-4 sm:py-4 sm:px-6 md:px-12 flex justify-between items-center bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b dark:border-gray-800 shadow-sm">
          {/* Logo - Responsive sizing */}
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

          {/* Desktop Navigation & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <nav className="hidden lg:flex space-x-6 xl:space-x-8 text-sm">
              {navLinks.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  className={getLinkClass(link.id)}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex space-x-2">
              <Link href="/login">
                <Button 
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2"
                >
                  Masuk
                </Button>
              </Link>
            </div>

            {/* Theme Toggle - Smaller on mobile */}
            <div className="scale-90 sm:scale-100">
              <ThemeToggle />
            </div>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-[280px] sm:w-[350px] px-6"
              >
                {/* Logo Section */}
                <div className="flex items-center space-x-2 pt-6 pb-8 border-b dark:border-gray-800">
                  <Image
                    src="/images/logo_smaber.png"
                    alt="Logo SMAN 1 Berbek"
                    width={32}
                    height={32}
                  />
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-50">
                    SMAN 1 Berbek
                  </span>
                </div>

                <nav className="flex flex-col h-full">
                  {/* Mobile Navigation Links */}
                  <div className="flex-1 py-6 space-y-1">
                    {navLinks.map((link) => (
                      <a
                        key={link.id}
                        onClick={() => setIsOpen(false)}
                        href={`#${link.id}`}
                        className={`${getMobileLinkClass(link.id)} px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>

                  {/* Mobile Auth Buttons */}
                  <div className="flex flex-col space-y-3 pb-6 border-t dark:border-gray-800 pt-6">
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full h-12 text-base font-medium"
                      >
                        Masuk
                      </Button>
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Main Content - Optimized spacing for mobile */}
        <main className="flex-grow">
          <section id="hero" className="scroll-mt-16">
            <HeroSection />
          </section>
          <section id="manfaat" className="scroll-mt-16">
            <BenefitsSection />
          </section>
          <section id="fitur" className="scroll-mt-16">
            <FeaturesSection />
          </section>
          <section id="cara-kerja" className="scroll-mt-16">
            <HowItWorksSection />
          </section>
          <section id="testimoni" className="scroll-mt-16">
            <TestimonialsSection />
          </section>
          <section id="faq" className="scroll-mt-16">
            <FaqSection />
          </section>
          <section id="security" className="scroll-mt-16">
            <SecuritySection />
          </section>
          <section id="final-cta" className="scroll-mt-16">
            <FinalCTASection />
          </section>
        </main>

        <Footer />
        <ScrollToTopButton />
      </div>
    </ThemeProvider>
  );
}