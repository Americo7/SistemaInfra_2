/*
  Warnings:

  - You are about to drop the column `estado` on the `cluster_nodos` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `clusters` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `k8s_endpoints` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `proxmox_endpoints` table. All the data in the column will be lost.
  - Added the required column `_estado` to the `cluster_nodos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `_estado` to the `clusters` table without a default value. This is not possible if the table is not empty.
  - Added the required column `_estado` to the `k8s_endpoints` table without a default value. This is not possible if the table is not empty.
  - Added the required column `_estado` to the `proxmox_endpoints` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "registro"."cluster_nodos" DROP COLUMN "estado",
ADD COLUMN     "_estado" "registro"."estado" NOT NULL;

-- AlterTable
ALTER TABLE "registro"."clusters" DROP COLUMN "estado",
ADD COLUMN     "_estado" "registro"."estado" NOT NULL;

-- AlterTable
ALTER TABLE "registro"."k8s_endpoints" DROP COLUMN "estado",
ADD COLUMN     "_estado" "registro"."estado" NOT NULL;

-- AlterTable
ALTER TABLE "registro"."proxmox_endpoints" DROP COLUMN "estado",
ADD COLUMN     "_estado" "registro"."estado" NOT NULL;
