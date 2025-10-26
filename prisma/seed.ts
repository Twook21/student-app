// import { PrismaClient } from '@prisma/client';
// import bcrypt from 'bcryptjs';

// const prisma = new PrismaClient();

// async function main() {
//   console.log('🌱 Starting database seed...');

//   const hashedPassword = await bcrypt.hash('password123', 10);

//   // ========== 1. CREATE USERS ==========
//   console.log('👤 Creating users...');

//   const superAdmin = await prisma.user.upsert({
//     where: { email: 'admin@sekolah.com' },
//     update: {},
//     create: {
//       name: 'Super Admin',
//       email: 'admin@sekolah.com',
//       password: hashedPassword,
//       role: 'SUPERADMIN',
//     },
//   });

//   const bk1 = await prisma.user.upsert({
//     where: { email: 'bk@sekolah.com' },
//     update: {},
//     create: {
//       name: 'Ibu Sri Mulyani',
//       email: 'bk@sekolah.com',
//       password: hashedPassword,
//       role: 'BK',
//     },
//   });

//   const waliKelas1 = await prisma.user.upsert({
//     where: { email: 'wali.rpl1@sekolah.com' },
//     update: {},
//     create: {
//       name: 'Pak Budi Santoso',
//       email: 'wali.rpl1@sekolah.com',
//       password: hashedPassword,
//       role: 'WALIKELAS',
//     },
//   });

//   const waliKelas2 = await prisma.user.upsert({
//     where: { email: 'wali.rpl2@sekolah.com' },
//     update: {},
//     create: {
//       name: 'Bu Ani Wulandari',
//       email: 'wali.rpl2@sekolah.com',
//       password: hashedPassword,
//       role: 'WALIKELAS',
//     },
//   });

//   const waliKelas3 = await prisma.user.upsert({
//     where: { email: 'wali.tkj1@sekolah.com' },
//     update: {},
//     create: {
//       name: 'Pak Joko Widodo',
//       email: 'wali.tkj1@sekolah.com',
//       password: hashedPassword,
//       role: 'WALIKELAS',
//     },
//   });

//   const guruMapel1 = await prisma.user.upsert({
//     where: { email: 'guru.mtk@sekolah.com' },
//     update: {},
//     create: {
//       name: 'Bu Siti Nurhaliza',
//       email: 'guru.mtk@sekolah.com',
//       password: hashedPassword,
//       role: 'GURUMAPEL',
//       mapel: 'Matematika',
//     },
//   });

//   const guruMapel2 = await prisma.user.upsert({
//     where: { email: 'guru.ipa@sekolah.com' },
//     update: {},
//     create: {
//       name: 'Pak Ahmad Yani',
//       email: 'guru.ipa@sekolah.com',
//       password: hashedPassword,
//       role: 'GURUMAPEL',
//       mapel: 'IPA',
//     },
//   });

//   const orangTua1 = await prisma.user.upsert({
//     where: { email: 'ortu.andi@gmail.com' },
//     update: {},
//     create: {
//       name: 'Bp. Hartono (Ayah Andi)',
//       email: 'ortu.andi@gmail.com',
//       password: hashedPassword,
//       role: 'ORANGTUA',
//     },
//   });

//   const orangTua2 = await prisma.user.upsert({
//     where: { email: 'ortu.budi@gmail.com' },
//     update: {},
//     create: {
//       name: 'Ibu Dewi (Ibu Budi)',
//       email: 'ortu.budi@gmail.com',
//       password: hashedPassword,
//       role: 'ORANGTUA',
//     },
//   });

//   const orangTua3 = await prisma.user.upsert({
//     where: { email: 'ortu.citra@gmail.com' },
//     update: {},
//     create: {
//       name: 'Bp. Hendra (Ayah Citra)',
//       email: 'ortu.citra@gmail.com',
//       password: hashedPassword,
//       role: 'ORANGTUA',
//     },
//   });

//   const siswaUser1 = await prisma.user.upsert({
//     where: { email: 'andi.pratama@siswa.com' },
//     update: {},
//     create: {
//       name: 'Andi Pratama',
//       email: 'andi.pratama@siswa.com',
//       password: hashedPassword,
//       role: 'SISWA',
//     },
//   });

//   const siswaUser2 = await prisma.user.upsert({
//     where: { email: 'budi.setiawan@siswa.com' },
//     update: {},
//     create: {
//       name: 'Budi Setiawan',
//       email: 'budi.setiawan@siswa.com',
//       password: hashedPassword,
//       role: 'SISWA',
//     },
//   });

//   const siswaUser3 = await prisma.user.upsert({
//     where: { email: 'citra.dewi@siswa.com' },
//     update: {},
//     create: {
//       name: 'Citra Dewi',
//       email: 'citra.dewi@siswa.com',
//       password: hashedPassword,
//       role: 'SISWA',
//     },
//   });

//   console.log('✅ Users created');

//   // ========== 2. CREATE KATEGORI ==========
//   console.log('📁 Creating categories...');

//   const kategoriTerlambat = await prisma.kategori.create({
//     data: {
//       nama: 'Terlambat',
//       tipe: 'PELANGGARAN',
//       poinDefault: 5,
//     },
//   });

//   const kategoriSeragam = await prisma.kategori.create({
//     data: {
//       nama: 'Tidak Berseragam Lengkap',
//       tipe: 'PELANGGARAN',
//       poinDefault: 10,
//     },
//   });

//   const kategoriJuaraSekolah = await prisma.kategori.create({
//     data: {
//       nama: 'Juara Lomba Tingkat Sekolah',
//       tipe: 'PRESTASI',
//       poinDefault: 25,
//     },
//   });

//   console.log('✅ Categories created');

//   // ========== 3. CREATE SISWA ==========
//   console.log('🎓 Creating students...');

//   const siswa1 = await prisma.siswa.create({
//     data: {
//       nama: 'Andi Pratama',
//       nis: '2024001',
//       kelas: 'XI-RPL-1',
//       gender: 'L',
//       waliKelasId: waliKelas1.id,
//       orangTuaId: orangTua1.id,
//       userId: siswaUser1.id,
//     },
//   });

//   const siswa2 = await prisma.siswa.create({
//     data: {
//       nama: 'Budi Setiawan',
//       nis: '2024002',
//       kelas: 'XI-RPL-1',
//       gender: 'L',
//       waliKelasId: waliKelas1.id,
//       orangTuaId: orangTua2.id,
//       userId: siswaUser2.id,
//     },
//   });

//   const siswa3 = await prisma.siswa.create({
//     data: {
//       nama: 'Citra Dewi',
//       nis: '2024003',
//       kelas: 'XI-RPL-2',
//       gender: 'P',
//       waliKelasId: waliKelas2.id,
//       orangTuaId: orangTua3.id,
//       userId: siswaUser3.id,
//     },
//   });

//   console.log('✅ Students created');

//   // ========== 4. CREATE PELANGGARAN ==========
//   console.log('⚠️ Creating violations...');

//   await prisma.pelanggaran.create({
//     data: {
//       siswaId: siswa1.id,
//       guruId: waliKelas1.id,
//       kategoriId: kategoriTerlambat.id,
//       deskripsi: 'Terlambat 15 menit masuk kelas',
//       poin: 5,
//       status: 'DISETUJUI',
//       approvedByWaliKelasId: waliKelas1.id,
//       approvedByWaliKelasAt: new Date(),
//       needsWaliKelasApproval: false,
//       tanggal: new Date('2025-01-15'),
//     },
//   });

//   await prisma.pelanggaran.create({
//     data: {
//       siswaId: siswa2.id,
//       guruId: waliKelas1.id,
//       kategoriId: kategoriSeragam.id,
//       deskripsi: 'Tidak memakai dasi saat upacara',
//       poin: 10,
//       status: 'MENUNGGU',
//       needsWaliKelasApproval: true,
//       tanggal: new Date('2025-01-18'),
//     },
//   });

//   console.log('✅ Violations created');

//   // ========== 5. CREATE PRESTASI ==========
//   console.log('🏆 Creating achievements...');

//   await prisma.prestasi.create({
//     data: {
//       siswaId: siswa1.id,
//       guruId: guruMapel1.id,
//       kategoriId: kategoriJuaraSekolah.id,
//       deskripsi: 'Juara 1 Lomba Cerdas Cermat Matematika',
//       poin: 25,
//       status: 'DISETUJUI',
//       tanggal: new Date('2025-02-01'),
//     },
//   });

//   console.log('✅ Achievements created');

//   // ========== 6. CREATE NOTIFIKASI ==========
//   console.log('🔔 Creating notifications...');

//   await prisma.notifikasi.create({
//     data: {
//       userId: orangTua1.id,
//       title: 'Pelanggaran Baru',
//       message: 'Andi Pratama mendapat pelanggaran: Terlambat masuk kelas.',
//     },
//   });

//   await prisma.notifikasi.create({
//     data: {
//       userId: orangTua1.id,
//       title: 'Prestasi Baru',
//       message: 'Andi Pratama mendapat prestasi: Juara 1 Lomba Cerdas Cermat.',
//     },
//   });

//   console.log('✅ Notifications created');

//   console.log('\n🎉 Seed completed successfully!');
//   console.log('📋 Login Credentials: semua password = password123');
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
