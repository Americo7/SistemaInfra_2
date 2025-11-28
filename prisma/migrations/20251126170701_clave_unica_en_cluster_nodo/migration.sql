/*
  Warnings:

  - A unique constraint covering the columns `[clusterId,nombre]` on the table `cluster_nodos` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "cluster_nodos_clusterId_nombre_key" ON "registro"."cluster_nodos"("clusterId", "nombre");
