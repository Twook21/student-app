import { BookText, Users, Bell, BarChart2, ListChecks, History } from "lucide-react";

export function FeaturesSection() {
  const features = [
    { icon: BookText, title: "Pencatatan Real-time", description: "Input pelanggaran dan prestasi siswa secara instan oleh guru dan wali kelas." },
    { icon: Users, title: "Akses Multi-Peran", description: "Platform terpadu untuk Guru, Wali Kelas, Orang Tua, Siswa, dan Admin dengan hak akses berbeda." },
    { icon: Bell, title: "Notifikasi Otomatis", description: "Orang tua menerima notifikasi instan setiap ada perubahan poin siswa." },
    { icon: BarChart2, title: "Laporan & Visualisasi", description: "Lihat rekapitulasi data dan grafik perkembangan perilaku siswa untuk evaluasi." },
    { icon: ListChecks, title: "Kategorisasi Poin", description: "Pengelompokan jenis pelanggaran dan prestasi dengan bobot poin yang jelas dan konsisten." },
    { icon: History, title: "Riwayat Lengkap", description: "Akses histori pelanggaran dan prestasi siswa kapan saja sebagai bahan evaluasi berkala." },
  ];

  return (
    <section className="py-20 md:py-32 bg-white dark:bg-gray-950" id="fitur">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-gray-900 dark:text-gray-50 animate-slide-up">
          Fitur Unggulan
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto text-center animate-slide-up">
          Dirancang untuk memudahkan pengelolaan dan pemantauan karakter siswa.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 md:gap-x-16">
          {features.map((feature, index) => (
            <div key={index} className={`flex items-start space-x-4 animate-slide-up staggered-${(index % 3) + 1}`}>
              <div className="p-3 mt-1 text-blue-600 dark:text-blue-400 rounded-full flex-shrink-0">
                <feature.icon size={24} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}