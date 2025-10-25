import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password untuk semua user (password: "password123")
  const hashedPassword = await bcrypt.hash('password123', 10);

  // ========== 1. CREATE USERS ==========
  console.log('👤 Creating users...');

  // Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@sekolah.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@sekolah.com',
      password: hashedPassword,
      role: 'SUPERADMIN',
    },
  });

  // Guru BK
  const bk1 = await prisma.user.upsert({
    where: { email: 'bk@sekolah.com' },
    update: {},
    create: {
      name: 'Ibu Sri Mulyani',
      email: 'bk@sekolah.com',
      password: hashedPassword,
      role: 'BK',
    },
  });

  // Wali Kelas
  const waliKelas1 = await prisma.user.upsert({
    where: { email: 'wali.rpl1@sekolah.com' },
    update: {},
    create: {
      name: 'Pak Budi Santoso',
      email: 'wali.rpl1@sekolah.com',
      password: hashedPassword,
      role: 'WALIKELAS',
    },
  });

  const waliKelas2 = await prisma.user.upsert({
    where: { email: 'wali.rpl2@sekolah.com' },
    update: {},
    create: {
      name: 'Bu Ani Wulandari',
      email: 'wali.rpl2@sekolah.com',
      password: hashedPassword,
      role: 'WALIKELAS',
    },
  });

  const waliKelas3 = await prisma.user.upsert({
    where: { email: 'wali.tkj1@sekolah.com' },
    update: {},
    create: {
      name: 'Pak Joko Widodo',
      email: 'wali.tkj1@sekolah.com',
      password: hashedPassword,
      role: 'WALIKELAS',
    },
  });

  // Guru Mapel
  const guruMapel1 = await prisma.user.upsert({
    where: { email: 'guru.mtk@sekolah.com' },
    update: {},
    create: {
      name: 'Bu Siti Nurhaliza',
      email: 'guru.mtk@sekolah.com',
      password: hashedPassword,
      role: 'GURUMAPEL',
    },
  });

  const guruMapel2 = await prisma.user.upsert({
    where: { email: 'guru.ipa@sekolah.com' },
    update: {},
    create: {
      name: 'Pak Ahmad Yani',
      email: 'guru.ipa@sekolah.com',
      password: hashedPassword,
      role: 'GURUMAPEL',
    },
  });

  // Orang Tua
  const orangTua1 = await prisma.user.upsert({
    where: { email: 'ortu.andi@gmail.com' },
    update: {},
    create: {
      name: 'Bp. Hartono (Ayah Andi)',
      email: 'ortu.andi@gmail.com',
      password: hashedPassword,
      role: 'ORANGTUA',
    },
  });

  const orangTua2 = await prisma.user.upsert({
    where: { email: 'ortu.budi@gmail.com' },
    update: {},
    create: {
      name: 'Ibu Dewi (Ibu Budi)',
      email: 'ortu.budi@gmail.com',
      password: hashedPassword,
      role: 'ORANGTUA',
    },
  });

  const orangTua3 = await prisma.user.upsert({
    where: { email: 'ortu.citra@gmail.com' },
    update: {},
    create: {
      name: 'Bp. Hendra (Ayah Citra)',
      email: 'ortu.citra@gmail.com',
      password: hashedPassword,
      role: 'ORANGTUA',
    },
  });

  const orangTua4 = await prisma.user.upsert({
    where: { email: 'ortu.dina@gmail.com' },
    update: {},
    create: {
      name: 'Ibu Sari (Ibu Dina)',
      email: 'ortu.dina@gmail.com',
      password: hashedPassword,
      role: 'ORANGTUA',
    },
  });

  const orangTua5 = await prisma.user.upsert({
    where: { email: 'ortu.eko@gmail.com' },
    update: {},
    create: {
      name: 'Bp. Bambang (Ayah Eko)',
      email: 'ortu.eko@gmail.com',
      password: hashedPassword,
      role: 'ORANGTUA',
    },
  });

  // Akun Siswa
  const siswaUser1 = await prisma.user.upsert({
    where: { email: 'andi.pratama@siswa.com' },
    update: {},
    create: {
      name: 'Andi Pratama',
      email: 'andi.pratama@siswa.com',
      password: hashedPassword,
      role: 'SISWA',
    },
  });

  const siswaUser2 = await prisma.user.upsert({
    where: { email: 'budi.setiawan@siswa.com' },
    update: {},
    create: {
      name: 'Budi Setiawan',
      email: 'budi.setiawan@siswa.com',
      password: hashedPassword,
      role: 'SISWA',
    },
  });

  const siswaUser3 = await prisma.user.upsert({
    where: { email: 'citra.dewi@siswa.com' },
    update: {},
    create: {
      name: 'Citra Dewi',
      email: 'citra.dewi@siswa.com',
      password: hashedPassword,
      role: 'SISWA',
    },
  });

  const siswaUser4 = await prisma.user.upsert({
    where: { email: 'dina.lestari@siswa.com' },
    update: {},
    create: {
      name: 'Dina Lestari',
      email: 'dina.lestari@siswa.com',
      password: hashedPassword,
      role: 'SISWA',
    },
  });

  const siswaUser5 = await prisma.user.upsert({
    where: { email: 'eko.wijaya@siswa.com' },
    update: {},
    create: {
      name: 'Eko Wijaya',
      email: 'eko.wijaya@siswa.com',
      password: hashedPassword,
      role: 'SISWA',
    },
  });

  console.log('✅ Users created');

  // ========== 2. CREATE KATEGORI ==========
  console.log('📁 Creating categories...');

  // Kategori Pelanggaran
  const kategoriTerlambat = await prisma.kategori.upsert({
    where: { id: 'kat-pelanggaran-1' },
    update: {},
    create: {
      id: 'kat-pelanggaran-1',
      nama: 'Terlambat',
      tipe: 'PELANGGARAN',
      poinDefault: 5,
    },
  });

  const kategoriSeragam = await prisma.kategori.upsert({
    where: { id: 'kat-pelanggaran-2' },
    update: {},
    create: {
      id: 'kat-pelanggaran-2',
      nama: 'Tidak Berseragam Lengkap',
      tipe: 'PELANGGARAN',
      poinDefault: 10,
    },
  });

  const kategoriBolos = await prisma.kategori.upsert({
    where: { id: 'kat-pelanggaran-3' },
    update: {},
    create: {
      id: 'kat-pelanggaran-3',
      nama: 'Bolos Tanpa Keterangan',
      tipe: 'PELANGGARAN',
      poinDefault: 20,
    },
  });

  const kategoriMerokok = await prisma.kategori.upsert({
    where: { id: 'kat-pelanggaran-4' },
    update: {},
    create: {
      id: 'kat-pelanggaran-4',
      nama: 'Merokok di Area Sekolah',
      tipe: 'PELANGGARAN',
      poinDefault: 30,
    },
  });

  const kategoriBerantem = await prisma.kategori.upsert({
    where: { id: 'kat-pelanggaran-5' },
    update: {},
    create: {
      id: 'kat-pelanggaran-5',
      nama: 'Berkelahi',
      tipe: 'PELANGGARAN',
      poinDefault: 50,
    },
  });

  const kategoriTidakMengerjakan = await prisma.kategori.upsert({
    where: { id: 'kat-pelanggaran-6' },
    update: {},
    create: {
      id: 'kat-pelanggaran-6',
      nama: 'Tidak Mengerjakan Tugas',
      tipe: 'PELANGGARAN',
      poinDefault: 5,
    },
  });

  // Kategori Prestasi
  const kategoriJuaraKota = await prisma.kategori.upsert({
    where: { id: 'kat-prestasi-1' },
    update: {},
    create: {
      id: 'kat-prestasi-1',
      nama: 'Juara Lomba Tingkat Kota',
      tipe: 'PRESTASI',
      poinDefault: 50,
    },
  });

  const kategoriJuaraSekolah = await prisma.kategori.upsert({
    where: { id: 'kat-prestasi-2' },
    update: {},
    create: {
      id: 'kat-prestasi-2',
      nama: 'Juara Lomba Tingkat Sekolah',
      tipe: 'PRESTASI',
      poinDefault: 25,
    },
  });

  const kategoriNilaiTertinggi = await prisma.kategori.upsert({
    where: { id: 'kat-prestasi-3' },
    update: {},
    create: {
      id: 'kat-prestasi-3',
      nama: 'Nilai Tertinggi Ujian',
      tipe: 'PRESTASI',
      poinDefault: 15,
    },
  });

  const kategoriKetua = await prisma.kategori.upsert({
    where: { id: 'kat-prestasi-4' },
    update: {},
    create: {
      id: 'kat-prestasi-4',
      nama: 'Ketua Organisasi/OSIS',
      tipe: 'PRESTASI',
      poinDefault: 30,
    },
  });

  const kategoriPialaOlahraga = await prisma.kategori.upsert({
    where: { id: 'kat-prestasi-5' },
    update: {},
    create: {
      id: 'kat-prestasi-5',
      nama: 'Juara Olahraga Tingkat Provinsi',
      tipe: 'PRESTASI',
      poinDefault: 75,
    },
  });

  console.log('✅ Categories created');

  // ========== 3. CREATE SISWA ==========
  console.log('🎓 Creating students...');

  const siswa1 = await prisma.siswa.upsert({
    where: { nis: '2024001' },
    update: {},
    create: {
      nis: '2024001',
      nama: 'Andi Pratama',
      kelas: 'XI-RPL-1',
      totalPoin: 0,
      waliKelasId: waliKelas1.id,
      orangTuaId: orangTua1.id,
      userId: siswaUser1.id,
    },
  });

  const siswa2 = await prisma.siswa.upsert({
    where: { nis: '2024002' },
    update: {},
    create: {
      nis: '2024002',
      nama: 'Budi Setiawan',
      kelas: 'XI-RPL-1',
      totalPoin: 0,
      waliKelasId: waliKelas1.id,
      orangTuaId: orangTua2.id,
      userId: siswaUser2.id,
    },
  });

  const siswa3 = await prisma.siswa.upsert({
    where: { nis: '2024003' },
    update: {},
    create: {
      nis: '2024003',
      nama: 'Citra Dewi',
      kelas: 'XI-RPL-2',
      totalPoin: 0,
      waliKelasId: waliKelas2.id,
      orangTuaId: orangTua3.id,
      userId: siswaUser3.id,
    },
  });

  const siswa4 = await prisma.siswa.upsert({
    where: { nis: '2024004' },
    update: {},
    create: {
      nis: '2024004',
      nama: 'Dina Lestari',
      kelas: 'XI-RPL-2',
      totalPoin: 0,
      waliKelasId: waliKelas2.id,
      orangTuaId: orangTua4.id,
      userId: siswaUser4.id,
    },
  });

  const siswa5 = await prisma.siswa.upsert({
    where: { nis: '2024005' },
    update: {},
    create: {
      nis: '2024005',
      nama: 'Eko Wijaya',
      kelas: 'XI-TKJ-1',
      totalPoin: 0,
      waliKelasId: waliKelas3.id,
      orangTuaId: orangTua5.id,
      userId: siswaUser5.id,
    },
  });

  const siswa6 = await prisma.siswa.create({
    data: {
      nis: '2024006',
      nama: 'Fajar Ramadhan',
      kelas: 'XI-RPL-1',
      totalPoin: 0,
      waliKelasId: waliKelas1.id,
    },
  });

  const siswa7 = await prisma.siswa.create({
    data: {
      nis: '2024007',
      nama: 'Gita Savitri',
      kelas: 'XI-RPL-2',
      totalPoin: 0,
      waliKelasId: waliKelas2.id,
    },
  });

  const siswa8 = await prisma.siswa.create({
    data: {
      nis: '2024008',
      nama: 'Hendra Kusuma',
      kelas: 'XI-TKJ-1',
      totalPoin: 0,
      waliKelasId: waliKelas3.id,
    },
  });

  console.log('✅ Students created');

  // ========== 4. CREATE PELANGGARAN ==========
  console.log('⚠️  Creating violations...');

  // Pelanggaran yang sudah disetujui
  const pelanggaran1 = await prisma.pelanggaran.create({
    data: {
      siswaId: siswa1.id,
      guruId: waliKelas1.id,
      kategoriId: kategoriTerlambat.id,
      deskripsi: 'Terlambat masuk kelas 15 menit',
      poin: 5,
      status: 'DISETUJUI',
      catatanBK: 'Dikonfirmasi oleh BK',
      tanggal: new Date('2025-01-15'),
    },
  });

  const pelanggaran2 = await prisma.pelanggaran.create({
    data: {
      siswaId: siswa2.id,
      guruId: waliKelas1.id,
      kategoriId: kategoriSeragam.id,
      deskripsi: 'Tidak memakai dasi',
      poin: 10,
      status: 'DISETUJUI',
      tanggal: new Date('2025-01-16'),
    },
  });

  const pelanggaran3 = await prisma.pelanggaran.create({
    data: {
      siswaId: siswa3.id,
      guruId: waliKelas2.id,
      kategoriId: kategoriTidakMengerjakan.id,
      deskripsi: 'Tidak mengerjakan PR Matematika',
      poin: 5,
      status: 'DISETUJUI',
      tanggal: new Date('2025-01-17'),
    },
  });

  // Pelanggaran menunggu approval
  const pelanggaran4 = await prisma.pelanggaran.create({
    data: {
      siswaId: siswa4.id,
      guruId: waliKelas2.id,
      kategoriId: kategoriTerlambat.id,
      deskripsi: 'Terlambat 10 menit',
      poin: 5,
      status: 'MENUNGGU',
      tanggal: new Date('2025-01-20'),
    },
  });

  const pelanggaran5 = await prisma.pelanggaran.create({
    data: {
      siswaId: siswa5.id,
      guruId: waliKelas3.id,
      kategoriId: kategoriBolos.id,
      deskripsi: 'Bolos pelajaran jam ke-3 dan ke-4',
      poin: 20,
      status: 'MENUNGGU',
      tanggal: new Date('2025-01-21'),
    },
  });

  // Update total poin siswa untuk pelanggaran yang disetujui
  await prisma.siswa.update({
    where: { id: siswa1.id },
    data: { totalPoin: -5 },
  });

  await prisma.siswa.update({
    where: { id: siswa2.id },
    data: { totalPoin: -10 },
  });

  await prisma.siswa.update({
    where: { id: siswa3.id },
    data: { totalPoin: -5 },
  });

  console.log('✅ Violations created');

  // ========== 5. CREATE PRESTASI ==========
  console.log('🏆 Creating achievements...');

  // Prestasi yang sudah disetujui
  const prestasi1 = await prisma.prestasi.create({
    data: {
      siswaId: siswa1.id,
      guruId: guruMapel1.id,
      kategoriId: kategoriJuaraSekolah.id,
      deskripsi: 'Juara 1 Lomba Cerdas Cermat Matematika Tingkat Sekolah',
      poin: 25,
      status: 'DISETUJUI',
      catatanBK: 'Prestasi yang membanggakan',
      tanggal: new Date('2025-01-10'),
    },
  });

  const prestasi2 = await prisma.prestasi.create({
    data: {
      siswaId: siswa3.id,
      guruId: guruMapel2.id,
      kategoriId: kategoriJuaraKota.id,
      deskripsi: 'Juara 2 Lomba Web Design Tingkat Kota',
      poin: 50,
      status: 'DISETUJUI',
      tanggal: new Date('2025-01-12'),
    },
  });

  const prestasi3 = await prisma.prestasi.create({
    data: {
      siswaId: siswa5.id,
      guruId: waliKelas3.id,
      kategoriId: kategoriNilaiTertinggi.id,
      deskripsi: 'Nilai tertinggi Ujian Tengah Semester',
      poin: 15,
      status: 'DISETUJUI',
      tanggal: new Date('2025-01-14'),
    },
  });

  // Prestasi menunggu approval
  const prestasi4 = await prisma.prestasi.create({
    data: {
      siswaId: siswa2.id,
      guruId: guruMapel1.id,
      kategoriId: kategoriNilaiTertinggi.id,
      deskripsi: 'Nilai 100 pada Ujian Pemrograman',
      poin: 15,
      status: 'MENUNGGU',
      tanggal: new Date('2025-01-22'),
    },
  });

  // Update total poin siswa untuk prestasi yang disetujui
  await prisma.siswa.update({
    where: { id: siswa1.id },
    data: { totalPoin: { increment: 25 } },
  });

  await prisma.siswa.update({
    where: { id: siswa3.id },
    data: { totalPoin: { increment: 50 } },
  });

  await prisma.siswa.update({
    where: { id: siswa5.id },
    data: { totalPoin: { increment: 15 } },
  });

  console.log('✅ Achievements created');

  // ========== 6. CREATE NOTIFIKASI ==========
  console.log('🔔 Creating notifications...');

  await prisma.notifikasi.create({
    data: {
      userId: orangTua1.id,
      title: 'Pelanggaran Baru',
      message: 'Andi Pratama mendapat pelanggaran: Terlambat',
      isRead: false,
    },
  });

  await prisma.notifikasi.create({
    data: {
      userId: orangTua1.id,
      title: 'Prestasi Baru',
      message: 'Andi Pratama mendapat prestasi: Juara 1 Lomba Cerdas Cermat',
      isRead: false,
    },
  });

  await prisma.notifikasi.create({
    data: {
      userId: orangTua3.id,
      title: 'Prestasi Disetujui',
      message: 'Prestasi Citra Dewi telah disetujui oleh BK',
      isRead: true,
    },
  });

  await prisma.notifikasi.create({
    data: {
      userId: bk1.id,
      title: 'Pelanggaran Baru Menunggu Approval',
      message: 'Terdapat 2 pelanggaran yang menunggu approval',
      isRead: false,
    },
  });

  console.log('✅ Notifications created');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📋 Login Credentials (password untuk semua: password123):');
  console.log('─────────────────────────────────────────────────────');
  console.log('👑 Super Admin:  admin@sekolah.com');
  console.log('👔 Guru BK:       bk@sekolah.com');
  console.log('👨‍🏫 Wali Kelas RPL-1: wali.rpl1@sekolah.com');
  console.log('👩‍🏫 Wali Kelas RPL-2: wali.rpl2@sekolah.com');
  console.log('👨‍🏫 Wali Kelas TKJ-1: wali.tkj1@sekolah.com');
  console.log('👨‍🏫 Guru Mapel MTK:   guru.mtk@sekolah.com');
  console.log('👨‍🏫 Guru Mapel IPA:   guru.ipa@sekolah.com');
  console.log('');
  console.log('🎓 Akun Siswa:');
  console.log('   • andi.pratama@siswa.com   (XI-RPL-1, Poin: 20)');
  console.log('   • budi.setiawan@siswa.com  (XI-RPL-1, Poin: -10)');
  console.log('   • citra.dewi@siswa.com     (XI-RPL-2, Poin: 45)');
  console.log('   • dina.lestari@siswa.com   (XI-RPL-2, Poin: 0)');
  console.log('   • eko.wijaya@siswa.com     (XI-TKJ-1, Poin: 15)');
  console.log('');
  console.log('👪 Akun Orang Tua:');
  console.log('   • ortu.andi@gmail.com   (Orang tua Andi Pratama)');
  console.log('   • ortu.budi@gmail.com   (Orang tua Budi Setiawan)');
  console.log('   • ortu.citra@gmail.com  (Orang tua Citra Dewi)');
  console.log('   • ortu.dina@gmail.com   (Orang tua Dina Lestari)');
  console.log('   • ortu.eko@gmail.com    (Orang tua Eko Wijaya)');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });