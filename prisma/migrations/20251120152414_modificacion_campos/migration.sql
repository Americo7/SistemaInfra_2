/*
  Warnings:

  - You are about to drop the column `proxmox_vmid` on the `maquinas` table. All the data in the column will be lost.
  - Added the required column `nombre` to the `cluster_nodos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `es_virtual` to the `maquinas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "registro"."cluster_nodos" ADD COLUMN     "nombre" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "registro"."maquinas" DROP COLUMN "proxmox_vmid",
ADD COLUMN     "es_virtual" BOOLEAN NOT NULL;
