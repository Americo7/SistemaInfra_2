/*
  Warnings:

  - You are about to drop the column `fecha_modificacion` on the `endpoint_sync_log` table. All the data in the column will be lost.
  - You are about to drop the column `usuario_modificacion` on the `endpoint_sync_log` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "registro"."endpoint_sync_log" DROP COLUMN "fecha_modificacion",
DROP COLUMN "usuario_modificacion";
