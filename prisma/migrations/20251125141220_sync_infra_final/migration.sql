/*
  Warnings:

  - You are about to drop the column `id_cluster` on the `despliegue` table. All the data in the column will be lost.
  - You are about to drop the column `codigo` on the `maquinas` table. All the data in the column will be lost.
  - You are about to drop the column `es_virtual` on the `maquinas` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[k8s_uid]` on the table `cluster_nodos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombre,id_proxmox_endpoint]` on the table `clusters` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombre,id_k8s_endpoint]` on the table `clusters` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `maquinas` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mac_address]` on the table `maquinas` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `nodoTipo` on the `cluster_nodos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "registro"."nodo_tipo" AS ENUM ('VIRTUAL', 'FISICO');

-- DropForeignKey
ALTER TABLE "registro"."despliegue" DROP CONSTRAINT "fk_componente_id";

-- DropForeignKey
ALTER TABLE "registro"."despliegue" DROP CONSTRAINT "fk_desppliegue_maquina";

-- DropForeignKey
ALTER TABLE "registro"."maquinas" DROP CONSTRAINT "maquinas_id_servidor_fkey";

-- AlterTable
ALTER TABLE "registro"."cluster_nodos" ADD COLUMN     "k8s_uid" VARCHAR(100),
DROP COLUMN "nodoTipo",
ADD COLUMN     "nodoTipo" "registro"."nodo_tipo" NOT NULL;

-- AlterTable
ALTER TABLE "registro"."clusters" ADD COLUMN     "id_k8s_endpoint" INTEGER,
ADD COLUMN     "id_proxmox_endpoint" INTEGER;

-- AlterTable
ALTER TABLE "registro"."despliegue" DROP COLUMN "id_cluster",
ADD COLUMN     "id_servidor" INTEGER;

-- AlterTable
ALTER TABLE "registro"."maquinas" DROP COLUMN "codigo",
DROP COLUMN "es_virtual",
ADD COLUMN     "mac_address" VARCHAR(50),
ADD COLUMN     "proxmox_vmid" INTEGER,
ADD COLUMN     "uuid" VARCHAR(100),
ALTER COLUMN "ip" DROP NOT NULL,
ALTER COLUMN "id_servidor" DROP NOT NULL;

-- AlterTable
ALTER TABLE "registro"."servidores" ADD COLUMN     "sistema_operativo" VARCHAR(50);

-- CreateIndex
CREATE UNIQUE INDEX "cluster_nodos_k8s_uid_key" ON "registro"."cluster_nodos"("k8s_uid");

-- CreateIndex
CREATE UNIQUE INDEX "clusters_nombre_id_proxmox_endpoint_key" ON "registro"."clusters"("nombre", "id_proxmox_endpoint");

-- CreateIndex
CREATE UNIQUE INDEX "clusters_nombre_id_k8s_endpoint_key" ON "registro"."clusters"("nombre", "id_k8s_endpoint");

-- CreateIndex
CREATE UNIQUE INDEX "maquinas_uuid_key" ON "registro"."maquinas"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "maquinas_mac_address_key" ON "registro"."maquinas"("mac_address");

-- CreateIndex
CREATE INDEX "maquinas_proxmox_vmid_idx" ON "registro"."maquinas"("proxmox_vmid");

-- CreateIndex
CREATE INDEX "maquinas_ip_idx" ON "registro"."maquinas"("ip");

-- AddForeignKey
ALTER TABLE "registro"."despliegue" ADD CONSTRAINT "despliegue_id_servidor_fkey" FOREIGN KEY ("id_servidor") REFERENCES "registro"."servidores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."despliegue" ADD CONSTRAINT "despliegue_id_componente_fkey" FOREIGN KEY ("id_componente") REFERENCES "registro"."componentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro"."despliegue" ADD CONSTRAINT "despliegue_id_maquina_fkey" FOREIGN KEY ("id_maquina") REFERENCES "registro"."maquinas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro"."maquinas" ADD CONSTRAINT "maquinas_id_servidor_fkey" FOREIGN KEY ("id_servidor") REFERENCES "registro"."servidores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro"."clusters" ADD CONSTRAINT "clusters_id_proxmox_endpoint_fkey" FOREIGN KEY ("id_proxmox_endpoint") REFERENCES "registro"."proxmox_endpoints"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro"."clusters" ADD CONSTRAINT "clusters_id_k8s_endpoint_fkey" FOREIGN KEY ("id_k8s_endpoint") REFERENCES "registro"."k8s_endpoints"("id") ON DELETE SET NULL ON UPDATE CASCADE;
