/*
  Warnings:

  - A unique constraint covering the columns `[nombre,ip_primaria]` on the table `servidores` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "servidores_nombre_ip_primaria_key" ON "registro"."servidores"("nombre", "ip_primaria");
