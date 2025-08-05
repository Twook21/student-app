import { Button } from "@/components/ui/button";

export function FinalCTASection() {
  return (
    <section className="py-20 md:py-32 bg-blue-600 dark:bg-blue-800 text-white text-center">
      <div className="container mx-auto px-4 md:px-6 animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Siap Wujudkan Pendidikan Berkarakter?
        </h2>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Mulai sekarang untuk menciptakan lingkungan belajar yang disiplin dan penuh prestasi.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 rounded-full transition-colors duration-200 text-lg px-8">
            Hubungi Kami
          </Button>
          <Button size="lg" className="bg-blue-800 dark:bg-blue-600 hover:bg-blue-900 dark:hover:bg-blue-700 text-white rounded-full transition-colors duration-200 text-lg px-8">
            Masuk Sekarang
          </Button>
        </div>
      </div>
    </section>
  );
}