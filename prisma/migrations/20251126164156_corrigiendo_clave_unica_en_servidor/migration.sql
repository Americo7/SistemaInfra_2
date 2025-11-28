/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `servidores` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "registro"."servidores_nombre_ip_primaria_key";

-- CreateIndex
CREATE UNIQUE INDEX "servidores_nombre_key" ON "registro"."servidores"("nombre");
