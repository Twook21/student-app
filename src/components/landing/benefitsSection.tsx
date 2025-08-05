import { GraduationCap, Users, ShieldCheck } from "lucide-react";

export function BenefitsSection() {
  const benefits = [
    { icon: GraduationCap, title: "Untuk Guru", description: "Mencatat poin, melihat riwayat siswa, dan membuat laporan dengan lebih cepat dan efisien." },
    { icon: Users, title: "Untuk Orang Tua", description: "Memantau perkembangan karakter dan prestasi anak secara real-time melalui notifikasi." },
    { icon: ShieldCheck, title: "Untuk Sekolah", description: "Memiliki data terpusat untuk evaluasi, transparansi, dan pengambilan keputusan yang tepat." },
  ];

  return (
    <section className="py-20 md:py-32 bg-gray-50 dark:bg-gray-900" id="manfaat">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-gray-50 animate-slide-up">
          Manfaat untuk Semua Pihak
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto animate-slide-up">
          Sistem ini dirancang untuk menciptakan ekosistem pendidikan yang transparan, kolaboratif, dan efektif.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`flex flex-col items-center text-center p-8 bg-white dark:bg-gray-950 rounded-xl shadow-md border dark:border-gray-800 animate-slide-up staggered-${index + 1}`}
            >
              <div className="mb-4 text-blue-600 dark:text-blue-400">
                <benefit.icon size={48} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 px-2 text-sm">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}