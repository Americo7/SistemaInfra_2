/*
  Warnings:

  - You are about to drop the column `fecha_creacion` on the `cluster_nodos` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_modificacion` on the `cluster_nodos` table. All the data in the column will be lost.
  - You are about to drop the column `usuario_creacion` on the `cluster_nodos` table. All the data in the column will be lost.
  - You are about to drop the column `usuario_modificacion` on the `cluster_nodos` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_creacion` on the `clusters` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_modificacion` on the `clusters` table. All the data in the column will be lost.
  - You are about to drop the column `usuario_creacion` on the `clusters` table. All the data in the column will be lost.
  - You are about to drop the column `usuario_modificacion` on the `clusters` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_creacion` on the `k8s_endpoints` table. All the data in the column will be lost.
  - You are about to drop the column `usuario_creacion` on the `k8s_endpoints` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_creacion` on the `proxmox_endpoints` table. All the data in the column will be lost.
  - You are about to drop the column `usuario_creacion` on the `proxmox_endpoints` table. All the data in the column will be lost.
  - Added the required column `_usuario_creacion` to the `cluster_nodos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `_usuario_creacion` to the `clusters` table without a default value. This is not possible if the table is not empty.
  - Added the required column `_usuario_creacion` to the `k8s_endpoints` table without a default value. This is not possible if the table is not empty.
  - Added the required column `_usuario_creacion` to the `proxmox_endpoints` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "registro"."cluster_nodos" DROP COLUMN "fecha_creacion",
DROP COLUMN "fecha_modificacion",
DROP COLUMN "usuario_creacion",
DROP COLUMN "usuario_modificacion",
ADD COLUMN     "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "_fecha_modificacion" TIMESTAMP(6),
ADD COLUMN     "_usuario_creacion" INTEGER NOT NULL,
ADD COLUMN     "_usuario_modificacion" INTEGER;

-- AlterTable
ALTER TABLE "registro"."clusters" DROP COLUMN "fecha_creacion",
DROP COLUMN "fecha_modificacion",
DROP COLUMN "usuario_creacion",
DROP COLUMN "usuario_modificacion",
ADD COLUMN     "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "_fecha_modificacion" TIMESTAMP(6),
ADD COLUMN     "_usuario_creacion" INTEGER NOT NULL,
ADD COLUMN     "_usuario_modificacion" INTEGER;

-- AlterTable
ALTER TABLE "registro"."k8s_endpoints" DROP COLUMN "fecha_creacion",
DROP COLUMN "usuario_creacion",
ADD COLUMN     "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "_fecha_modificacion" TIMESTAMP(6),
ADD COLUMN     "_usuario_creacion" INTEGER NOT NULL,
ADD COLUMN     "_usuario_modificacion" INTEGER;

-- AlterTable
ALTER TABLE "registro"."proxmox_endpoints" DROP COLUMN "fecha_creacion",
DROP COLUMN "usuario_creacion",
ADD COLUMN     "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "_fecha_modificacion" TIMESTAMP(6),
ADD COLUMN     "_usuario_creacion" INTEGER NOT NULL,
ADD COLUMN     "_usuario_modificacion" INTEGER;
