/*
  Warnings:

  - You are about to drop the `maquinas_virtuales` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "registro"."cluster_nodos" DROP CONSTRAINT "cluster_nodos_maquinaId_fkey";

-- DropForeignKey
ALTER TABLE "registro"."despliegue" DROP CONSTRAINT "fk_desppliegue_maquina";

-- DropForeignKey
ALTER TABLE "registro"."infra_afectada" DROP CONSTRAINT "fk_maquina_evento";

-- DropForeignKey
ALTER TABLE "registro"."maquinas_virtuales" DROP CONSTRAINT "maquinas_virtuales_id_servidor_fkey";

-- DropForeignKey
ALTER TABLE "registro"."usuario_roles" DROP CONSTRAINT "fk_maquina_usuario_roles";

-- AlterTable
ALTER TABLE "registro"."servidores" ADD COLUMN     "ip_primaria" INTEGER;

-- DropTable
DROP TABLE "registro"."maquinas_virtuales";

-- CreateTable
CREATE TABLE "registro"."maquinas" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(50),
    "nombre" VARCHAR(50) NOT NULL,
    "ip" INET NOT NULL,
    "so" VARCHAR(25) NOT NULL,
    "ram" SMALLINT NOT NULL,
    "almacenamiento" JSON NOT NULL,
    "cpu" SMALLINT NOT NULL,
    "_estado" "registro"."estado" NOT NULL,
    "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_creacion" INTEGER NOT NULL,
    "_fecha_modificacion" TIMESTAMP(6),
    "_usuario_modificacion" INTEGER,
    "cod_plataforma" VARCHAR(20) NOT NULL,
    "proxmox_vmid" INTEGER,
    "id_servidor" INTEGER NOT NULL,

    CONSTRAINT "maquina_pk" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "registro"."despliegue" ADD CONSTRAINT "fk_desppliegue_maquina" FOREIGN KEY ("id_maquina") REFERENCES "registro"."maquinas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."usuario_roles" ADD CONSTRAINT "fk_maquina_usuario_roles" FOREIGN KEY ("id_maquina") REFERENCES "registro"."maquinas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."infra_afectada" ADD CONSTRAINT "fk_maquina_evento" FOREIGN KEY ("id_maquina") REFERENCES "registro"."maquinas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."maquinas" ADD CONSTRAINT "maquinas_id_servidor_fkey" FOREIGN KEY ("id_servidor") REFERENCES "registro"."servidores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro"."cluster_nodos" ADD CONSTRAINT "cluster_nodos_maquinaId_fkey" FOREIGN KEY ("maquinaId") REFERENCES "registro"."maquinas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
