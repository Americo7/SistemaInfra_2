-- DropForeignKey
ALTER TABLE "registro"."servidores" DROP CONSTRAINT "servidores_id_data_center_fkey";

-- AlterTable
ALTER TABLE "registro"."maquinas" ALTER COLUMN "so" DROP NOT NULL;

-- AlterTable
ALTER TABLE "registro"."servidores" ALTER COLUMN "cod_inventario_agetic" DROP NOT NULL,
ALTER COLUMN "id_data_center" DROP NOT NULL,
ALTER COLUMN "serie" DROP NOT NULL,
ALTER COLUMN "cod_tipo_servidor" DROP NOT NULL,
ALTER COLUMN "marca" DROP NOT NULL,
ALTER COLUMN "modelo" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "registro"."servidores" ADD CONSTRAINT "servidores_id_data_center_fkey" FOREIGN KEY ("id_data_center") REFERENCES "registro"."data_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
