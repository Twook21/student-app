import Image from "next/image";

export function TestimonialsSection() {
  const testimonials = [
    { quote: "Sistem ini sangat membantu saya memantau perkembangan kedisiplinan anak secara instan. Notifikasinya sangat informatif!", name: "Bapak Budi Santoso", role: "Orang Tua Siswa", avatar: "https://placehold.co/100x100/ADD8E6/000000?text=BS" },
    { quote: "Pencatatan pelanggaran jadi lebih mudah dan terpusat. Saya bisa fokus pada pembinaan, bukan pada administrasi.", name: "Ibu Siti Nurhayati", role: "Wali Kelas", avatar: "https://placehold.co/100x100/ADD8E6/000000?text=SN" },
    { quote: "Kami dapat melihat data siswa secara komprehensif, membantu kami mengambil keputusan yang lebih baik untuk sekolah.", name: "Kepala Sekolah SMAN 1 Berbek", role: "Admin", avatar: "/images/headmaster.png" },
  ];

  return (
    <section className="py-20 md:py-32 bg-gray-50 dark:bg-gray-900" id="testimoni">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-gray-50 animate-slide-up">
          Apa Kata Mereka?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto animate-slide-up">
          Dengar langsung pengalaman dari pengguna yang telah merasakan manfaat sistem ini.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {testimonials.map((testimonial, index) => (
            <div key={index} className={`flex flex-col items-center animate-slide-up staggered-${(index % 3) + 1}`}>
              <p className="text-gray-700 dark:text-gray-300 italic mb-6 relative px-4 text-sm md:text-base">
                <span className="absolute -top-4 -left-4 text-blue-100 dark:text-gray-800 text-6xl font-serif md:text-8xl">"</span>
                {testimonial.quote}
                <span className="absolute -bottom-4 -right-4 text-blue-100 dark:text-gray-800 text-6xl font-serif md:text-8xl">"</span>
              </p>
              <div className="flex flex-col items-center mt-8">
                <Image
                  src={testimonial.avatar}
                  alt={`Foto ${testimonial.name}`}
                  width={50}
                  height={50}
                  className="rounded-full border mb-2"
                />
                <h4 className="font-semibold text-gray-900 dark:text-gray-50">{testimonial.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}