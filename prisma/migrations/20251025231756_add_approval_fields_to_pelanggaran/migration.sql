-- AlterTable
ALTER TABLE "public"."pelanggaran" ADD COLUMN     "approvedByWaliKelasAt" TIMESTAMP(3),
ADD COLUMN     "approvedByWaliKelasId" TEXT,
ADD COLUMN     "needsWaliKelasApproval" BOOLEAN NOT NULL DEFAULT true;
