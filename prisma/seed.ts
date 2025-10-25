import { PrismaClient, Role, TipeKategori } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Mulai seeding database...");

  const password = await bcrypt.hash("password123", 10);

  // 👑 SUPER ADMIN
  const superAdmin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "superadmin@example.com",
      password,
      role: Role.SUPERADMIN,
    },
  });

  // 👩‍🏫 Guru BK
  const guruBK = await prisma.user.create({
    data: {
      name: "Bu Rini (BK)",
      email: "bk@example.com",
      password,
      role: Role.BK,
    },
  });

  // 👨‍🏫 Wali Kelas
  const waliKelas = await prisma.user.create({
    data: {
      name: "Pak Dedi (Wali Kelas)",
      email: "walikelas@example.com",
      password,
      role: Role.WALIKELAS,
    },
  });

  // 📚 Guru Mapel
  const guruMapel = await prisma.user.create({
    data: {
      name: "Bu Sinta (Guru Mapel)",
      email: "gurumapel@example.com",
      password,
      role: Role.GURUMAPEL,
    },
  });

  // 👨‍👧 Orang Tua
  const orangTua = await prisma.user.create({
    data: {
      name: "Pak Budi (Orang Tua Andi)",
      email: "ortu@example.com",
      password,
      role: Role.ORANGTUA,
    },
  });

  // 👦 Siswa (User)
  const siswaUser = await prisma.user.create({
    data: {
      name: "Andi Pratama",
      email: "siswa@example.com",
      password,
      role: Role.SISWA,
    },
  });

  // 🧑‍🎓 Data Siswa
  const siswa = await prisma.siswa.create({
    data: {
      nama: "Andi Pratama",
      nis: "123456",
      kelas: "XII RPL 1",
      orangTuaId: orangTua.id,
      waliKelasId: waliKelas.id,
      totalPoin: 0,
    },
  });

  // 🏷️ Kategori Pelanggaran & Prestasi
  const kategoriPelanggaran1 = await prisma.kategori.create({
    data: {
      nama: "Tidak memakai seragam lengkap",
      tipe: TipeKategori.PELANGGARAN,
      poinDefault: -5,
    },
  });

  const kategoriPelanggaran2 = await prisma.kategori.create({
    data: {
      nama: "Datang terlambat",
      tipe: TipeKategori.PELANGGARAN,
      poinDefault: -10,
    },
  });

  const kategoriPrestasi1 = await prisma.kategori.create({
    data: {
      nama: "Juara Lomba Matematika",
      tipe: TipeKategori.PRESTASI,
      poinDefault: 20,
    },
  });

  const kategoriPrestasi2 = await prisma.kategori.create({
    data: {
      nama: "Aktif dalam kegiatan OSIS",
      tipe: TipeKategori.PRESTASI,
      poinDefault: 10,
    },
  });

  // ❌ Contoh Pelanggaran
  await prisma.pelanggaran.create({
    data: {
      siswaId: siswa.id,
      guruId: guruMapel.id,
      kategoriId: kategoriPelanggaran1.id,
      deskripsi: "Siswa tidak memakai dasi saat upacara.",
      poin: kategoriPelanggaran1.poinDefault,
    },
  });

  // 🏆 Contoh Prestasi
  await prisma.prestasi.create({
    data: {
      siswaId: siswa.id,
      guruId: guruMapel.id,
      kategoriId: kategoriPrestasi1.id,
      deskripsi: "Menjuarai olimpiade matematika tingkat kota.",
      poin: kategoriPrestasi1.poinDefault,
    },
  });

  // 🔔 Notifikasi untuk Orang Tua
  await prisma.notifikasi.create({
    data: {
      userId: orangTua.id,
      title: "Pelanggaran Baru",
      message: "Anak Anda melakukan pelanggaran ringan: tidak memakai seragam lengkap.",
    },
  });

  console.log("✅ Seeding selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
