/*
  Warnings:

  - Added the required column `ip_primaria` to the `servidores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "registro"."servidores" DROP COLUMN "ip_primaria",
ADD COLUMN     "ip_primaria" INET NOT NULL;
