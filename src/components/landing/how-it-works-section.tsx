import { CheckCircle, BellRing, Eye, FileText } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    { icon: CheckCircle, title: "Catat", description: "Guru dan Wali Kelas mencatat poin pelanggaran atau prestasi melalui dasbor." },
    { icon: BellRing, title: "Notifikasi", description: "Sistem mengirimkan notifikasi otomatis ke orang tua dan siswa." },
    { icon: Eye, title: "Pantau", description: "Orang tua dan siswa dapat melihat riwayat poin dan perkembangan mereka." },
    { icon: FileText, title: "Kelola & Lapor", description: "Admin mengelola data dan menghasilkan laporan komprehensif." },
  ];

  return (
    <section className="py-20 md:py-32 bg-white dark:bg-gray-950" id="cara-kerja">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-gray-900 dark:text-gray-50 animate-slide-up">
          Bagaimana Sistem Ini Bekerja?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto text-center animate-slide-up">
          Proses yang sederhana dan efisien untuk semua pihak yang terlibat.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col items-center text-center p-8 bg-gray-50 dark:bg-gray-900 rounded-xl shadow-md border dark:border-gray-800 animate-slide-up staggered-${index + 1}`}
            >
              <div className="mb-4 text-blue-600 dark:text-blue-400">
                <step.icon size={48} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}