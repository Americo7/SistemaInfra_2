/*
  Warnings:

  - A unique constraint covering the columns `[codigo]` on the table `entidades` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "registro"."usuarios" ALTER COLUMN "id_ciudadano_digital" SET DATA TYPE VARCHAR(50);

-- CreateIndex
CREATE UNIQUE INDEX "entidades_codigo_key" ON "registro"."entidades"("codigo");
