/*
  Warnings:

  - You are about to drop the column `k8s_uid` on the `cluster_nodos` table. All the data in the column will be lost.
  - You are about to drop the column `mac_address` on the `maquinas` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[identity_key]` on the table `cluster_nodos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[identity_key]` on the table `maquinas` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[identity_key]` on the table `servidores` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `identity_key` to the `cluster_nodos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `identity_key` to the `maquinas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `identity_key` to the `servidores` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "registro"."cluster_nodos_clusterId_nombre_key";

-- DropIndex
DROP INDEX "registro"."cluster_nodos_k8s_uid_key";

-- DropIndex
DROP INDEX "registro"."maquinas_mac_address_key";

-- DropIndex
DROP INDEX "registro"."maquinas_uuid_key";

-- DropIndex
DROP INDEX "registro"."servidores_nombre_key";

-- AlterTable
ALTER TABLE "registro"."cluster_nodos" DROP COLUMN "k8s_uid",
ADD COLUMN     "identity_key" VARCHAR(200) NOT NULL;

-- AlterTable
ALTER TABLE "registro"."maquinas" DROP COLUMN "mac_address",
ADD COLUMN     "identity_key" VARCHAR(200) NOT NULL;

-- AlterTable
ALTER TABLE "registro"."servidores" ADD COLUMN     "identity_key" VARCHAR(200) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "cluster_nodos_identity_key_key" ON "registro"."cluster_nodos"("identity_key");

-- CreateIndex
CREATE INDEX "cluster_nodos_nombre_idx" ON "registro"."cluster_nodos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "maquinas_identity_key_key" ON "registro"."maquinas"("identity_key");

-- CreateIndex
CREATE UNIQUE INDEX "servidores_identity_key_key" ON "registro"."servidores"("identity_key");

-- CreateIndex
CREATE INDEX "servidores_nombre_idx" ON "registro"."servidores"("nombre");
