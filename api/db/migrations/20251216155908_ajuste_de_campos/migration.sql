/*
  Warnings:

  - A unique constraint covering the columns `[cod_tipo_rol]` on the table `roles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "registro"."uq_usuario_rol_contexto";

-- CreateIndex
CREATE UNIQUE INDEX "roles_cod_tipo_rol_key" ON "registro"."roles"("cod_tipo_rol");
