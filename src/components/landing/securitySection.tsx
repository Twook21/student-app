import { Lock, ShieldCheck, Database } from "lucide-react";

export function SecuritySection() {
  const securityFeatures = [
    { icon: Lock, title: "Enkripsi Data", description: "Semua data sensitif siswa dienkripsi untuk memastikan kerahasiaan dan keamanan." },
    { icon: ShieldCheck, title: "Akses Terbatas", description: "Setiap peran memiliki hak akses yang berbeda, hanya melihat data yang relevan dengan tugasnya." },
    { icon: Database, title: "Pencadangan Rutin", description: "Data dicadangkan secara rutin untuk mencegah kehilangan informasi penting." },
  ];

  return (
    <section className="py-20 md:py-32 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-gray-50 animate-slide-up">
          Keamanan Data Terjamin
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto animate-slide-up">
          Kami berkomitmen untuk menjaga keamanan dan kerahasiaan data siswa dan sekolah Anda.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 md:gap-x-16">
          {securityFeatures.map((feature, index) => (
            <div key={index} className={`flex flex-col items-center text-center animate-slide-up staggered-${index + 1}`}>
              <div className="mb-4 text-blue-600 dark:text-blue-400">
                <feature.icon size={48} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}