-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "parametricas";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "registro";

-- CreateEnum
CREATE TYPE "registro"."estado" AS ENUM ('ACTIVO', 'INACTIVO');

-- CreateEnum
CREATE TYPE "registro"."nodo_tipo" AS ENUM ('VIRTUAL', 'FISICO');

-- CreateEnum
CREATE TYPE "registro"."tipo_endpoint" AS ENUM ('PROXMOX', 'K8S');

-- CreateEnum
CREATE TYPE "registro"."estado_sync" AS ENUM ('INICIADO', 'EXITOSO', 'ERROR', 'PARCIAL');

-- CreateEnum
CREATE TYPE "registro"."sync_trigger" AS ENUM ('MANUAL', 'CRON');

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
    "id_servidor" INTEGER,
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
    "version_aplicacion" VARCHAR(50),
    "git_commit" VARCHAR(40),
    "tipo_despliegue" VARCHAR(20),

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
    "id_servidor" INTEGER,
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
    "id_ciudadano_digital" VARCHAR(50),
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
    "nombre" VARCHAR(50) NOT NULL,
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
    "nombre" VARCHAR(50) NOT NULL,
    "proxmox_vmid" INTEGER,
    "ip" INET,
    "so" VARCHAR(100),
    "cod_plataforma" VARCHAR(20),
    "ram" SMALLINT NOT NULL,
    "cpu" SMALLINT NOT NULL,
    "almacenamiento" JSON NOT NULL,
    "estado_operativo" VARCHAR(20),
    "_estado" "registro"."estado" NOT NULL,
    "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_creacion" INTEGER NOT NULL,
    "_fecha_modificacion" TIMESTAMP(6),
    "_usuario_modificacion" INTEGER,
    "id_servidor" INTEGER,
    "identity_key" VARCHAR(200) NOT NULL,

    CONSTRAINT "maquina_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro"."servidores" (
    "id" SERIAL NOT NULL,
    "id_data_center" INTEGER,
    "id_padre" INTEGER,
    "nombre" VARCHAR(30) NOT NULL,
    "cod_inventario_agetic" VARCHAR(10),
    "cod_tipo_servidor" VARCHAR(20),
    "serie" VARCHAR(30),
    "marca" VARCHAR(30),
    "modelo" VARCHAR(50),
    "ram" SMALLINT,
    "almacenamiento" SMALLINT,
    "ip_primaria" INET,
    "sistema_operativo" VARCHAR(50),
    "estado_operativo" VARCHAR(15) NOT NULL,
    "_estado" "registro"."estado" NOT NULL,
    "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_creacion" INTEGER NOT NULL,
    "_fecha_modificacion" TIMESTAMP(6),
    "_usuario_modificacion" INTEGER,
    "identity_key" VARCHAR(200) NOT NULL,

    CONSTRAINT "servidor_pk" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro"."cluster_nodos" (
    "id" SERIAL NOT NULL,
    "clusterId" INTEGER NOT NULL,
    "nombre" VARCHAR(50) NOT NULL,
    "nodoTipo" "registro"."nodo_tipo" NOT NULL,
    "maquinaId" INTEGER,
    "servidorId" INTEGER,
    "rol" TEXT,
    "_estado" "registro"."estado" NOT NULL,
    "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_creacion" INTEGER NOT NULL,
    "_fecha_modificacion" TIMESTAMP(6),
    "_usuario_modificacion" INTEGER,
    "identity_key" VARCHAR(200) NOT NULL,

    CONSTRAINT "cluster_nodos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro"."clusters" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "cod_tipo_cluster" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "_estado" "registro"."estado" NOT NULL,
    "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_creacion" INTEGER NOT NULL,
    "_fecha_modificacion" TIMESTAMP(6),
    "_usuario_modificacion" INTEGER,
    "identity_key" VARCHAR(200) NOT NULL,
    "id_proxmox_endpoint" INTEGER,
    "id_k8s_endpoint" INTEGER,

    CONSTRAINT "cluster_pk" PRIMARY KEY ("id")
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
    "_estado" "registro"."estado" NOT NULL,
    "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_creacion" INTEGER NOT NULL,
    "_fecha_modificacion" TIMESTAMP(6),
    "_usuario_modificacion" INTEGER,

    CONSTRAINT "proxmox_endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro"."k8s_endpoints" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(30) NOT NULL,
    "url_api" VARCHAR(200) NOT NULL,
    "token_bearer" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha_ultima_sync" TIMESTAMP(3),
    "_estado" "registro"."estado" NOT NULL,
    "_fecha_creacion" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_creacion" INTEGER NOT NULL,
    "_fecha_modificacion" TIMESTAMP(6),
    "_usuario_modificacion" INTEGER,

    CONSTRAINT "k8s_endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro"."endpoint_sync_log" (
    "id" SERIAL NOT NULL,
    "tipo_endpoint" "registro"."tipo_endpoint" NOT NULL,
    "id_proxmox_endpoint" INTEGER,
    "id_k8s_endpoint" INTEGER,
    "estado_sync" "registro"."estado_sync" NOT NULL,
    "trigger" "registro"."sync_trigger" NOT NULL,
    "mensaje" TEXT,
    "error_detalle" TEXT,
    "snapshot_resultado" JSONB,
    "total_clusters" INTEGER,
    "total_servidores" INTEGER,
    "total_maquinas" INTEGER,
    "total_nodos" INTEGER,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3),
    "duracion_ms" INTEGER,
    "_estado" "registro"."estado" NOT NULL,
    "_fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "_usuario_creacion" INTEGER NOT NULL,
    "fecha_modificacion" TIMESTAMP(3),
    "usuario_modificacion" INTEGER,

    CONSTRAINT "endpoint_sync_log_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "entidades_codigo_key" ON "registro"."entidades"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "sistemas_codigo_key" ON "registro"."sistemas"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "uq_usuario_rol_contexto" ON "registro"."usuario_roles"("id_usuario", "id_rol", "id_sistema", "id_maquina", "id_servidor");

-- CreateIndex
CREATE UNIQUE INDEX "parametro_codigo_uq" ON "parametricas"."parametros"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "maquinas_identity_key_key" ON "registro"."maquinas"("identity_key");

-- CreateIndex
CREATE INDEX "maquinas_proxmox_vmid_idx" ON "registro"."maquinas"("proxmox_vmid");

-- CreateIndex
CREATE INDEX "maquinas_ip_idx" ON "registro"."maquinas"("ip");

-- CreateIndex
CREATE UNIQUE INDEX "servidores_identity_key_key" ON "registro"."servidores"("identity_key");

-- CreateIndex
CREATE INDEX "servidores_nombre_idx" ON "registro"."servidores"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "cluster_nodos_identity_key_key" ON "registro"."cluster_nodos"("identity_key");

-- CreateIndex
CREATE INDEX "cluster_nodos_nombre_idx" ON "registro"."cluster_nodos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "clusters_identity_key_key" ON "registro"."clusters"("identity_key");

-- CreateIndex
CREATE UNIQUE INDEX "clusters_nombre_id_proxmox_endpoint_key" ON "registro"."clusters"("nombre", "id_proxmox_endpoint");

-- CreateIndex
CREATE UNIQUE INDEX "clusters_nombre_id_k8s_endpoint_key" ON "registro"."clusters"("nombre", "id_k8s_endpoint");

-- CreateIndex
CREATE INDEX "endpoint_sync_log_id_proxmox_endpoint_fecha_inicio_idx" ON "registro"."endpoint_sync_log"("id_proxmox_endpoint", "fecha_inicio");

-- CreateIndex
CREATE INDEX "endpoint_sync_log_id_k8s_endpoint_fecha_inicio_idx" ON "registro"."endpoint_sync_log"("id_k8s_endpoint", "fecha_inicio");

-- CreateIndex
CREATE INDEX "endpoint_sync_log_fecha_inicio_idx" ON "registro"."endpoint_sync_log"("fecha_inicio");

-- CreateIndex
CREATE INDEX "endpoint_sync_log_tipo_endpoint_idx" ON "registro"."endpoint_sync_log"("tipo_endpoint");

-- CreateIndex
CREATE INDEX "endpoint_sync_log_estado_sync_idx" ON "registro"."endpoint_sync_log"("estado_sync");

-- AddForeignKey
ALTER TABLE "registro"."componentes" ADD CONSTRAINT "fk_sistema_id" FOREIGN KEY ("id_sistema") REFERENCES "registro"."sistemas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."despliegue" ADD CONSTRAINT "despliegue_id_servidor_fkey" FOREIGN KEY ("id_servidor") REFERENCES "registro"."servidores"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."despliegue" ADD CONSTRAINT "despliegue_id_componente_fkey" FOREIGN KEY ("id_componente") REFERENCES "registro"."componentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro"."despliegue" ADD CONSTRAINT "despliegue_id_maquina_fkey" FOREIGN KEY ("id_maquina") REFERENCES "registro"."maquinas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro"."sistemas" ADD CONSTRAINT "fk_entidad_id" FOREIGN KEY ("id_entidad") REFERENCES "registro"."entidades"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."sistemas" ADD CONSTRAINT "fk_sistema_padre_id" FOREIGN KEY ("id_padre") REFERENCES "registro"."sistemas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."usuario_roles" ADD CONSTRAINT "fk_maquina_usuario_roles" FOREIGN KEY ("id_maquina") REFERENCES "registro"."maquinas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "registro"."usuario_roles" ADD CONSTRAINT "fk_servidor_usuario_roles" FOREIGN KEY ("id_servidor") REFERENCES "registro"."servidores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "registro"."maquinas" ADD CONSTRAINT "maquinas_id_servidor_fkey" FOREIGN KEY ("id_servidor") REFERENCES "registro"."servidores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro"."servidores" ADD CONSTRAINT "servidores_id_data_center_fkey" FOREIGN KEY ("id_data_center") REFERENCES "registro"."data_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro"."servidores" ADD CONSTRAINT "servidores_id_padre_fkey" FOREIGN KEY ("id_padre") REFERENCES "registro"."servidores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro"."cluster_nodos" ADD CONSTRAINT "cluster_nodos_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "registro"."clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro"."cluster_nodos" ADD CONSTRAINT "cluster_nodos_maquinaId_fkey" FOREIGN KEY ("maquinaId") REFERENCES "registro"."maquinas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro"."cluster_nodos" ADD CONSTRAINT "cluster_nodos_servidorId_fkey" FOREIGN KEY ("servidorId") REFERENCES "registro"."servidores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro"."clusters" ADD CONSTRAINT "clusters_id_proxmox_endpoint_fkey" FOREIGN KEY ("id_proxmox_endpoint") REFERENCES "registro"."proxmox_endpoints"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro"."clusters" ADD CONSTRAINT "clusters_id_k8s_endpoint_fkey" FOREIGN KEY ("id_k8s_endpoint") REFERENCES "registro"."k8s_endpoints"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro"."endpoint_sync_log" ADD CONSTRAINT "endpoint_sync_log_id_proxmox_endpoint_fkey" FOREIGN KEY ("id_proxmox_endpoint") REFERENCES "registro"."proxmox_endpoints"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro"."endpoint_sync_log" ADD CONSTRAINT "endpoint_sync_log_id_k8s_endpoint_fkey" FOREIGN KEY ("id_k8s_endpoint") REFERENCES "registro"."k8s_endpoints"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro"."despliegue_bitacora" ADD CONSTRAINT "fk_bitacora_despliegue" FOREIGN KEY ("id_despliegue") REFERENCES "registro"."despliegue"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
