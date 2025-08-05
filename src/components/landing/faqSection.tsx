import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export function FaqSection() {
  const faqs = [
    { question: "Bagaimana cara guru mencatat poin pelanggaran?", answer: "Guru dapat masuk ke dasbor, memilih nama siswa, dan memilih jenis pelanggaran dari daftar yang tersedia. Poin akan otomatis tercatat." },
    { question: "Apakah orang tua akan mendapat notifikasi setiap saat?", answer: "Ya, setiap kali ada perubahan poin (pelanggaran atau prestasi), sistem akan mengirimkan notifikasi instan ke akun orang tua." },
    { question: "Apakah data siswa aman?", answer: "Sistem ini dibangun dengan standar keamanan data yang tinggi. Data siswa dienkripsi dan hanya dapat diakses oleh pihak yang berwenang." },
    { question: "Apakah sistem ini berbayar?", answer: "Sistem ini adalah bagian dari fasilitas sekolah dan tidak ada biaya tambahan untuk siswa atau orang tua." },
  ];

  return (
    <section className="py-20 md:py-32 bg-white dark:bg-gray-950" id="faq">
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-gray-900 dark:text-gray-50 animate-slide-up">
          Pertanyaan Umum (FAQ)
        </h2>
        <div className="max-w-3xl mx-auto text-left animate-fade-in">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b-gray-300 dark:border-b-gray-700">
                <AccordionTrigger className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}