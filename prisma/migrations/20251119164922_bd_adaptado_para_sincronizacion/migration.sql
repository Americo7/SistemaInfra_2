/*
  Warnings:

  - You are about to drop the column `_estado` on the `clusters` table. All the data in the column will be lost.
  - You are about to drop the column `_fecha_creacion` on the `clusters` table. All the data in the column will be lost.
  - You are about to drop the column `_fecha_modificacion` on the `clusters` table. All the data in the column will be lost.
  - You are about to drop the column `_usuario_creacion` on the `clusters` table. All the data in the column will be lost.
  - You are about to drop the column `_usuario_modificacion` on the `clusters` table. All the data in the column will be lost.
  - You are about to drop the `maquina_clusters` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `maquinas` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `estado` to the `clusters` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuario_creacion` to the `clusters` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "registro"."despliegue" DROP CONSTRAINT "despliegue_clusters_fk";

-- DropForeignKey
ALTER TABLE "registro"."despliegue" DROP CONSTRAINT "fk_desppliegue_maquina";

-- DropForeignKey
ALTER TABLE "registro"."infra_afectada" DROP CONSTRAINT "fk_maquina_evento";

-- DropForeignKey
ALTER TABLE "registro"."maquina_clusters" DROP CONSTRAINT "clusters_maquina_fk";

-- DropForeignKey
ALTER TABLE "registro"."maquina_clusters" DROP CONSTRAINT "fk_maquina_cluster";

-- DropForeignKey
ALTER TABLE "registro"."maquinas" DROP CONSTRAINT "maquinas_servidores_fk";

-- DropForeignKey
ALTER TABLE "registro"."servidores" DROP CONSTRAINT "fk_hardware_servidor";

-- DropForeignKey
ALTER TABLE "registro"."servidores" DROP CONSTRAINT "fk_id_servidor_harware";

-- DropForeignKey
ALTER TABLE "registro"."usuario_roles" DROP CONSTRAINT "fk_maquina_usuario_roles";

-- AlterTable
ALTER TABLE "registro"."clusters" DROP COLUMN "_estado",
DROP COLUMN "_fecha_creacion",
DROP COLUMN "_fecha_modificacion",
DROP COLUMN "_usuario_creacion",
DROP COLUMN "_usuario_modificacion",
ADD COLUMN     "estado" "registro"."estado" NOT NULL,
ADD COLUMN     "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fecha_modificacion" TIMESTAMP(3),
ADD COLUMN     "usuario_creacion" INTEGER NOT NULL,
ADD COLUMN     "usuario_modificacion" INTEGER,
ALTER COLUMN "nombre" SET DATA TYPE TEXT,
ALTER COLUMN "cod_tipo_cluster" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "registro"."maquina_clusters";

-- DropTable
DROP TABLE "registro"."maquinas";

-- CreateTable
CREATE TABLE "registro"."maquinas_virtuales" (
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
    "es_virtual" BOOLEAN NOT NULL,
    "proxmox_vmid" INTEGER,
    "proxmox_node" TEXT,
    "id_servidor" INTEGER NOT NULL,

    CONSTRAINT "maquina_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro"."cluster_nodos" (
    "id" SERIAL NOT NULL,
    "clusterId" INTEGER NOT NULL,
    "nodoTipo" TEXT NOT NULL,
    "maquinaId" INTEGER,
    "servidorId" INTEGER,
    "rol" TEXT,
    "estado" "registro"."estado" NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_creacion" INTEGER NOT NULL,
    "fecha_modificacion" TIMESTAMP(3),
    "usuario_modificacion" INTEGER,

    CONSTRAINT "cluster_nodos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro"."proxmox_endpoints" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,
    "dominio" VARCHAR(200),
    "ip" VARCHAR(50),
    "puerto" INTEGER NOT NULL,
    "ssl" BOOLEAN NOT NULL,
    "usuario" VARCHAR(50) NOT NULL,
    "token_id" VARCHAR(50) NOT NULL,
    "token_secret" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "fecha_ultima_sync" TIMESTAMP(3),
    "estado" "registro"."estado" NOT NULL DEFAULT 'ACTIVO',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_creacion" INTEGER NOT NULL,

    CONSTRAINT "proxmox_endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro"."k8s_endpoints" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,
    "url_api" VARCHAR(200) NOT NULL,
    "token_bearer" VARCHAR(500) NOT NULL,
    "descripcion" TEXT,
    "fecha_ultima_sync" TIMESTAMP(3),
    "estado" "registro"."estado" NOT NULL DEFAULT 'ACTIVO',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_creacion" INTEGER NOT NULL,

    CONSTRAINT "k8s_endpoints_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "registro"."despliegue" ADD CONSTRAINT "fk_desppliegue_maquina" FOREIGN KEY ("id_maquina") REFERENCES "registro"."maquinas_virtuales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."usuario_roles" ADD CONSTRAINT "fk_maquina_usuario_roles" FOREIGN KEY ("id_maquina") REFERENCES "registro"."maquinas_virtuales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."infra_afectada" ADD CONSTRAINT "fk_maquina_evento" FOREIGN KEY ("id_maquina") REFERENCES "registro"."maquinas_virtuales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."maquinas_virtuales" ADD CONSTRAINT "maquinas_virtuales_id_servidor_fkey" FOREIGN KEY ("id_servidor") REFERENCES "registro"."servidores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro"."servidores" ADD CONSTRAINT "servidores_id_data_center_fkey" FOREIGN KEY ("id_data_center") REFERENCES "registro"."data_centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro"."servidores" ADD CONSTRAINT "servidores_id_padre_fkey" FOREIGN KEY ("id_padre") REFERENCES "registro"."servidores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro"."cluster_nodos" ADD CONSTRAINT "cluster_nodos_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "registro"."clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro"."cluster_nodos" ADD CONSTRAINT "cluster_nodos_maquinaId_fkey" FOREIGN KEY ("maquinaId") REFERENCES "registro"."maquinas_virtuales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro"."cluster_nodos" ADD CONSTRAINT "cluster_nodos_servidorId_fkey" FOREIGN KEY ("servidorId") REFERENCES "registro"."servidores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
