-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('SUPERADMIN', 'BK', 'WALIKELAS', 'GURUMAPEL', 'SISWA', 'ORANGTUA');

-- CreateEnum
CREATE TYPE "public"."StatusApproval" AS ENUM ('MENUNGGU', 'DISETUJUI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "public"."TipeKategori" AS ENUM ('PELANGGARAN', 'PRESTASI');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."siswa" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nis" TEXT NOT NULL,
    "kelas" TEXT NOT NULL,
    "totalPoin" INTEGER NOT NULL DEFAULT 0,
    "orangTuaId" TEXT,
    "waliKelasId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "siswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kategori" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tipe" "public"."TipeKategori" NOT NULL,
    "poinDefault" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pelanggaran" (
    "id" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "guruId" TEXT NOT NULL,
    "kategoriId" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "poin" INTEGER NOT NULL,
    "status" "public"."StatusApproval" NOT NULL DEFAULT 'MENUNGGU',
    "alasanSiswa" TEXT,
    "catatanBK" TEXT,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pelanggaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."prestasi" (
    "id" TEXT NOT NULL,
    "siswaId" TEXT NOT NULL,
    "guruId" TEXT NOT NULL,
    "kategoriId" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "poin" INTEGER NOT NULL,
    "status" "public"."StatusApproval" NOT NULL DEFAULT 'MENUNGGU',
    "catatanBK" TEXT,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prestasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifikasi" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "siswa_nis_key" ON "public"."siswa"("nis");

-- CreateIndex
CREATE UNIQUE INDEX "siswa_userId_key" ON "public"."siswa"("userId");

-- AddForeignKey
ALTER TABLE "public"."siswa" ADD CONSTRAINT "siswa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."siswa" ADD CONSTRAINT "siswa_orangTuaId_fkey" FOREIGN KEY ("orangTuaId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."siswa" ADD CONSTRAINT "siswa_waliKelasId_fkey" FOREIGN KEY ("waliKelasId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pelanggaran" ADD CONSTRAINT "pelanggaran_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "public"."siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pelanggaran" ADD CONSTRAINT "pelanggaran_guruId_fkey" FOREIGN KEY ("guruId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pelanggaran" ADD CONSTRAINT "pelanggaran_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "public"."kategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."prestasi" ADD CONSTRAINT "prestasi_siswaId_fkey" FOREIGN KEY ("siswaId") REFERENCES "public"."siswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."prestasi" ADD CONSTRAINT "prestasi_guruId_fkey" FOREIGN KEY ("guruId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."prestasi" ADD CONSTRAINT "prestasi_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "public"."kategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifikasi" ADD CONSTRAINT "notifikasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
