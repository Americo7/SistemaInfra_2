-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "autenticacion";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "parametricas";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "registro";

-- CreateEnum
CREATE TYPE "registro"."estado" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateTable
CREATE TABLE "autenticacion"."rol" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "autenticacion"."user" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL DEFAULT '',
    "salt" TEXT NOT NULL DEFAULT '',
    "resetToken" TEXT,
    "resetTokenExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "autenticacion"."user_rol" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "user_rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro"."componentes" (
    "id" SERIAL NOT NULL,
    "id_sistema" INTEGER NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,
    "dominio" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cod_entorno" VARCHAR(20) NOT NULL,
    "cod_categoria" VARCHAR(20) NOT NULL,
    "gitlab_repo" VARCHAR(50),
    "gitlab_rama" VARCHAR(50),
    "tecnologia" JSONB,
    "_estado" "registro"."estado" NOT NULL,
    "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_creacion" INTEGER NOT NULL,
    "_fecha_modificacion" TIMESTAMP(6),
    "_usuario_modificacion" INTEGER,

    CONSTRAINT "componente_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro"."despliegue" (
    "id" SERIAL NOT NULL,
    "id_componente" INTEGER NOT NULL,
    "id_maquina" INTEGER,
    "fecha_despliegue" TIMESTAMP(6) NOT NULL,
    "_estado" "registro"."estado" NOT NULL,
    "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_creacion" INTEGER NOT NULL,
    "_fecha_modificacion" TIMESTAMP(6),
    "_usuario_modificacion" INTEGER,
    "fecha_solicitud" TIMESTAMP(6) NOT NULL,
    "unidad_solicitante" VARCHAR(10) NOT NULL,
    "solicitante" TEXT NOT NULL,
    "cod_tipo_respaldo" VARCHAR(20) NOT NULL,
    "referencia_respaldo" VARCHAR(100) NOT NULL,
    "estado_despliegue" VARCHAR(20) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "id_cluster" INTEGER,

    CONSTRAINT "despliegue_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro"."entidades" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(10) NOT NULL,
    "sigla" VARCHAR(15) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "_estado" "registro"."estado" NOT NULL,
    "_fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_creacion" INTEGER NOT NULL,
    "_fecha_modificacion" TIMESTAMPTZ(6),
    "_usuario_modificacion" INTEGER,

    CONSTRAINT "entidades_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro"."roles" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,
    "cod_tipo_rol" VARCHAR(20) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "_estado" "registro"."estado" NOT NULL,
    "_fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_creacion" INTEGER NOT NULL,
    "_fecha_modificacion" TIMESTAMPTZ(6),
    "_usuario_modificacion" INTEGER,

    CONSTRAINT "roles_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro"."sistemas" (
    "id" SERIAL NOT NULL,
    "id_padre" INTEGER,
    "id_entidad" INTEGER NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "sigla" VARCHAR(25),
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "_estado" "registro"."estado" NOT NULL,
    "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_creacion" INTEGER NOT NULL,
    "_fecha_modificacion" TIMESTAMP(6),
    "_usuario_modificacion" INTEGER,
    "ra_creacion" VARCHAR(100),

    CONSTRAINT "sistema_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro"."usuario_roles" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_rol" INTEGER NOT NULL,
    "id_maquina" INTEGER,
    "id_sistema" INTEGER,
    "_estado" "registro"."estado" NOT NULL,
    "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_creacion" INTEGER NOT NULL,
    "_fecha_modificacion" TIMESTAMP(6),
    "_usuario_modificacion" INTEGER,

    CONSTRAINT "usuario_roles_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro"."usuarios" (
    "id" SERIAL NOT NULL,
    "id_ciudadano_digital" VARCHAR(30),
    "nombre_usuario" VARCHAR(25) NOT NULL,
    "contrasena" TEXT,
    "nro_documento" VARCHAR(20) NOT NULL,
    "nombres" VARCHAR(40) NOT NULL,
    "primer_apellido" VARCHAR(40) NOT NULL,
    "segundo_apellido" VARCHAR(40) NOT NULL,
    "celular" VARCHAR(15) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "_estado" "registro"."estado" NOT NULL,
    "_fecha_creacion" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_creacion" INTEGER NOT NULL,
    "_fecha_modificacion" TIMESTAMPTZ(6),
    "_usuario_modificacion" INTEGER,

    CONSTRAINT "usuario_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parametricas"."parametros" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nombre" TEXT NOT NULL,
    "grupo" VARCHAR(20) NOT NULL,
    "_estado" "registro"."estado" NOT NULL DEFAULT 'ACTIVO',
    "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_creacion" INTEGER NOT NULL,
    "_fecha_modificacion" TIMESTAMP(6),
    "_usuario_modificacion" INTEGER,
    "descripcion" TEXT,

    CONSTRAINT "parametros_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro"."data_centers" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(15) NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "_estado" "registro"."estado" NOT NULL DEFAULT 'ACTIVO',
    "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_creacion" INTEGER NOT NULL,
    "_fecha_modificacion" TIMESTAMP(6),
    "_usuario_modificacion" INTEGER,

    CONSTRAINT "data_centers_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro"."eventos" (
    "id" SERIAL NOT NULL,
    "cod_tipo_evento" VARCHAR(20) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha_evento" TIMESTAMP(6) NOT NULL,
    "responsables" INTEGER[],
    "estado_evento" VARCHAR(20) NOT NULL,
    "_estado" "registro"."estado" NOT NULL,
    "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_creacion" INTEGER NOT NULL,
    "_fecha_modificacion" TIMESTAMP(6),
    "_usuario_modificacion" INTEGER,
    "cite" VARCHAR(50),
    "solicitante" VARCHAR(100),
    "cod_evento" VARCHAR(30),

    CONSTRAINT "evento_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro"."eventos_bitacora" (
    "id" SERIAL NOT NULL,
    "id_evento" INTEGER NOT NULL,
    "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_creacion" INTEGER NOT NULL,
    "_fecha_modificacion" TIMESTAMP(6),
    "_usuario_modificacion" INTEGER,
    "estado_anterior" VARCHAR(20) NOT NULL,
    "estado_actual" VARCHAR(20) NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "evento_bitacora_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro"."infra_afectada" (
    "id" SERIAL NOT NULL,
    "id_evento" INTEGER NOT NULL,
    "id_data_center" INTEGER,
    "id_servidor" INTEGER,
    "id_maquina" INTEGER,
    "_estado" "registro"."estado" NOT NULL,
    "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_creacion" INTEGER NOT NULL,
    "_fecha_modificacion" TIMESTAMP(6),
    "_usuario_modificacion" INTEGER,

    CONSTRAINT "infra_afectada_pk" PRIMARY KEY ("id")
);

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
    "es_virtual" BOOLEAN NOT NULL,
    "id_servidor" INTEGER NOT NULL,

    CONSTRAINT "maquina_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro"."servidores" (
    "id" SERIAL NOT NULL,
    "cod_inventario_agetic" VARCHAR(10) NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,
    "ram" SMALLINT,
    "almacenamiento" SMALLINT,
    "estado_operativo" VARCHAR(15) NOT NULL,
    "_estado" "registro"."estado" NOT NULL,
    "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_creacion" INTEGER NOT NULL,
    "_fecha_modificacion" TIMESTAMP(6),
    "_usuario_modificacion" INTEGER,
    "id_data_center" INTEGER NOT NULL,
    "serie" VARCHAR(30) NOT NULL,
    "id_padre" INTEGER,
    "cod_tipo_servidor" VARCHAR(20) NOT NULL,
    "marca" VARCHAR(30) NOT NULL,
    "modelo" VARCHAR(50) NOT NULL,

    CONSTRAINT "servidor_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro"."clusters" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(25) NOT NULL,
    "cod_tipo_cluster" VARCHAR(20) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "_estado" "registro"."estado" NOT NULL,
    "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_creacion" INTEGER NOT NULL,
    "_fecha_modificacion" TIMESTAMP(6),
    "_usuario_modificacion" INTEGER,

    CONSTRAINT "cluster_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro"."despliegue_bitacora" (
    "id" SERIAL NOT NULL,
    "id_despliegue" INTEGER NOT NULL,
    "estado_anterior" VARCHAR(20) NOT NULL,
    "estado_actual" VARCHAR(20) NOT NULL,
    "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_creacion" INTEGER NOT NULL,
    "_fecha_modificacion" TIMESTAMP(6),
    "_usuario_modificacion" INTEGER,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "despliegue_bitacora_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro"."maquina_clusters" (
    "id" SERIAL NOT NULL,
    "id_maquina" INTEGER NOT NULL,
    "id_cluster" INTEGER NOT NULL,
    "_estado" "registro"."estado" NOT NULL,
    "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_creacion" INTEGER NOT NULL,
    "_fecha_modificacion" TIMESTAMP(6),
    "_usuario_modificacion" INTEGER,

    CONSTRAINT "vm_cluster_pk" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rol_name_key" ON "autenticacion"."rol"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "autenticacion"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "parametro_codigo_uq" ON "parametricas"."parametros"("codigo");

-- AddForeignKey
ALTER TABLE "autenticacion"."user_rol" ADD CONSTRAINT "user_rol_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "autenticacion"."rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "autenticacion"."user_rol" ADD CONSTRAINT "user_rol_userId_fkey" FOREIGN KEY ("userId") REFERENCES "autenticacion"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro"."componentes" ADD CONSTRAINT "fk_sistema_id" FOREIGN KEY ("id_sistema") REFERENCES "registro"."sistemas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."despliegue" ADD CONSTRAINT "despliegue_clusters_fk" FOREIGN KEY ("id_cluster") REFERENCES "registro"."clusters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."despliegue" ADD CONSTRAINT "fk_componente_id" FOREIGN KEY ("id_componente") REFERENCES "registro"."componentes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."despliegue" ADD CONSTRAINT "fk_desppliegue_maquina" FOREIGN KEY ("id_maquina") REFERENCES "registro"."maquinas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."sistemas" ADD CONSTRAINT "fk_entidad_id" FOREIGN KEY ("id_entidad") REFERENCES "registro"."entidades"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."sistemas" ADD CONSTRAINT "fk_sistema_padre_id" FOREIGN KEY ("id_padre") REFERENCES "registro"."sistemas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."usuario_roles" ADD CONSTRAINT "fk_maquina_usuario_roles" FOREIGN KEY ("id_maquina") REFERENCES "registro"."maquinas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."usuario_roles" ADD CONSTRAINT "fk_rol_id" FOREIGN KEY ("id_rol") REFERENCES "registro"."roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."usuario_roles" ADD CONSTRAINT "fk_sistema_2_id" FOREIGN KEY ("id_sistema") REFERENCES "registro"."sistemas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."usuario_roles" ADD CONSTRAINT "fk_usuario_id" FOREIGN KEY ("id_usuario") REFERENCES "registro"."usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."eventos_bitacora" ADD CONSTRAINT "fk_evento_bitacora" FOREIGN KEY ("id_evento") REFERENCES "registro"."eventos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."infra_afectada" ADD CONSTRAINT "fk_dtacenter_evento" FOREIGN KEY ("id_data_center") REFERENCES "registro"."data_centers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."infra_afectada" ADD CONSTRAINT "fk_eventos" FOREIGN KEY ("id_evento") REFERENCES "registro"."eventos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."infra_afectada" ADD CONSTRAINT "fk_maquina_evento" FOREIGN KEY ("id_maquina") REFERENCES "registro"."maquinas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."infra_afectada" ADD CONSTRAINT "fk_servidor_evento" FOREIGN KEY ("id_servidor") REFERENCES "registro"."servidores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."maquinas" ADD CONSTRAINT "maquinas_servidores_fk" FOREIGN KEY ("id_servidor") REFERENCES "registro"."servidores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."servidores" ADD CONSTRAINT "fk_hardware_servidor" FOREIGN KEY ("id_data_center") REFERENCES "registro"."data_centers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."servidores" ADD CONSTRAINT "fk_id_servidor_harware" FOREIGN KEY ("id_padre") REFERENCES "registro"."servidores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."despliegue_bitacora" ADD CONSTRAINT "fk_bitacora_despliegue" FOREIGN KEY ("id_despliegue") REFERENCES "registro"."despliegue"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."maquina_clusters" ADD CONSTRAINT "clusters_maquina_fk" FOREIGN KEY ("id_cluster") REFERENCES "registro"."clusters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."maquina_clusters" ADD CONSTRAINT "fk_maquina_cluster" FOREIGN KEY ("id_maquina") REFERENCES "registro"."maquinas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
