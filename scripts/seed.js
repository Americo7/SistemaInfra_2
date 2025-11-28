import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

export default async () => {
  try {
    console.log('🌱 Iniciando seed...')

    // ============================================================
    // 1. PARAMETROS (parametricas.parametros)
    // ============================================================
    await db.parametro.createMany({
      data: [
        // UNIDAD_AGETIC
        { codigo: 'UAF', nombre: 'Unidad Administrativa Financiera', grupo: 'UNIDAD_AGETIC', descripcion: 'Unidad Administrativa Financiera', usuario_creacion: 1 },
        { codigo: 'UGTD', nombre: 'Unidad de Gestión y Transformación Digital', grupo: 'UNIDAD_AGETIC', descripcion: 'Unidad de Gestión y Transformación Digital', usuario_creacion: 1 },
        { codigo: 'UPAT', nombre: 'Unidad de Producción y Actualización Tecnológica', grupo: 'UNIDAD_AGETIC', descripcion: 'Unidad de Producción y Actualización Tecnológica', usuario_creacion: 1 },
        { codigo: 'UIT', nombre: 'Unidad de Infraestructura Tecnológica', grupo: 'UNIDAD_AGETIC', descripcion: 'Unidad de Infraestructura Tecnológica', usuario_creacion: 1 },
        { codigo: 'UGAT', nombre: 'Unidad de Gestión y Asistencia Tecnológica', grupo: 'UNIDAD_AGETIC', descripcion: 'Unidad de Gestión y Asistencia Tecnológica', usuario_creacion: 1 },

        // TIPO_CLUSTER
        { codigo: 'K8S', nombre: 'Kubernetes', grupo: 'TIPO_CLUSTER', descripcion: 'Cluster Kubernetes', usuario_creacion: 1 },
        { codigo: 'PGS', nombre: 'PostgreSQL', grupo: 'TIPO_CLUSTER', descripcion: 'Cluster PostgreSQL', usuario_creacion: 1 },
        { codigo: 'MG', nombre: 'MongoDB', grupo: 'TIPO_CLUSTER', descripcion: 'Cluster MongoDB', usuario_creacion: 1 },
        { codigo: 'RB', nombre: 'RabbitMQ', grupo: 'TIPO_CLUSTER', descripcion: 'Cluster RabbitMQ', usuario_creacion: 1 },
        { codigo: 'VA', nombre: 'Vault', grupo: 'TIPO_CLUSTER', descripcion: 'Cluster Vault', usuario_creacion: 1 },

        // TIPO_EVENTO
        { codigo: 'INCIDENTE_HW', nombre: 'Incidente Hardware', grupo: 'TIPO_EVENTO', descripcion: 'Incidente hardware', usuario_creacion: 1 },
        { codigo: 'MANT_PROGRAMADO', nombre: 'Mantenimiento Programado', grupo: 'TIPO_EVENTO', descripcion: 'Mantenimiento programado', usuario_creacion: 1 },
        { codigo: 'INCIDENTE_SW', nombre: 'Incidente Software', grupo: 'TIPO_EVENTO', descripcion: 'Incidente software', usuario_creacion: 1 },
        { codigo: 'MANT_NOPROGRAMADO', nombre: 'Mantenimiento No Programado', grupo: 'TIPO_EVENTO', descripcion: 'Mantenimiento no programado', usuario_creacion: 1 },
        { codigo: 'ACTUALIZACION_SW', nombre: 'Actualización Software', grupo: 'TIPO_EVENTO', descripcion: 'Actualización software', usuario_creacion: 1 },
        { codigo: 'ACTUALIZACION_HW', nombre: 'Actualización Hardware', grupo: 'TIPO_EVENTO', descripcion: 'Actualización hardware', usuario_creacion: 1 },
        { codigo: 'CORTE_ENERGIA', nombre: 'Corte Energía', grupo: 'TIPO_EVENTO', descripcion: 'Corte energía eléctrica', usuario_creacion: 1 },

        // ESTADO_OPERATIVO
        { codigo: 'DEGRADADO', nombre: 'Degradado', grupo: 'ESTADO_OPERATIVO', descripcion: 'Estado degradado', usuario_creacion: 1 },
        { codigo: 'OPERATIVO', nombre: 'Operativo', grupo: 'ESTADO_OPERATIVO', descripcion: 'Estado operativo', usuario_creacion: 1 },
        { codigo: 'MANTENIMIENTO', nombre: 'Mantenimiento', grupo: 'ESTADO_OPERATIVO', descripcion: 'En mantenimiento', usuario_creacion: 1 },
        { codigo: 'FALLA', nombre: 'Falla', grupo: 'ESTADO_OPERATIVO', descripcion: 'En falla', usuario_creacion: 1 },
        { codigo: 'APAGADO', nombre: 'Apagado', grupo: 'ESTADO_OPERATIVO', descripcion: 'Apagado', usuario_creacion: 1 },
        { codigo: 'FUERA_SERVICIO', nombre: 'Fuera de Servicio', grupo: 'ESTADO_OPERATIVO', descripcion: 'Fuera de servicio', usuario_creacion: 1 },

        // ENTORNO
        { codigo: 'TEST', nombre: 'Testing', grupo: 'ENTORNO', descripcion: 'Entorno de testing', usuario_creacion: 1 },
        { codigo: 'PRE_PROD', nombre: 'Pre Producción', grupo: 'ENTORNO', descripcion: 'Entorno pre producción', usuario_creacion: 1 },
        { codigo: 'PROD', nombre: 'Producción', grupo: 'ENTORNO', descripcion: 'Entorno de producción', usuario_creacion: 1 },
        { codigo: 'DEMO', nombre: 'Demo', grupo: 'ENTORNO', descripcion: 'Entorno demo', usuario_creacion: 1 },

        // TIPO_SERVIDOR
        { codigo: 'RACK', nombre: 'Rack', grupo: 'TIPO_SERVIDOR', descripcion: 'Servidor rack', usuario_creacion: 1 },
        { codigo: 'TORRE', nombre: 'Torre', grupo: 'TIPO_SERVIDOR', descripcion: 'Servidor torre', usuario_creacion: 1 },
        { codigo: 'CHASIS', nombre: 'Chasis', grupo: 'TIPO_SERVIDOR', descripcion: 'Servidor chasis', usuario_creacion: 1 },
        { codigo: 'BLADE', nombre: 'Blade', grupo: 'TIPO_SERVIDOR', descripcion: 'Servidor blade', usuario_creacion: 1 },
        { codigo: 'BM', nombre: 'Bare Metal', grupo: 'TIPO_SERVIDOR', descripcion: 'Servidor físico', usuario_creacion: 1 },

        // TIPO_ROL
        { codigo: 'DB_EDIT', nombre: 'DB Editor', grupo: 'TIPO_ROL', descripcion: 'Editor BD', usuario_creacion: 1 },
        { codigo: 'SO_ROOT', nombre: 'SO Root', grupo: 'TIPO_ROL', descripcion: 'Root SO', usuario_creacion: 1 },
        { codigo: 'SO_ADM', nombre: 'SO Admin', grupo: 'TIPO_ROL', descripcion: 'Administrador SO', usuario_creacion: 1 },
        { codigo: 'SO_USR', nombre: 'SO User', grupo: 'TIPO_ROL', descripcion: 'Usuario SO', usuario_creacion: 1 },
        { codigo: 'DB_ADM', nombre: 'DB Admin', grupo: 'TIPO_ROL', descripcion: 'Administrador BD', usuario_creacion: 1 },
        { codigo: 'DB_DEV', nombre: 'DB Developer', grupo: 'TIPO_ROL', descripcion: 'Dev BD', usuario_creacion: 1 },
        { codigo: 'DB_READ', nombre: 'DB Reader', grupo: 'TIPO_ROL', descripcion: 'Lector BD', usuario_creacion: 1 },
        { codigo: 'SI_ADM', nombre: 'SI Admin', grupo: 'TIPO_ROL', descripcion: 'Administrador sistemas', usuario_creacion: 1 },

        // CATEGORIA
        { codigo: 'BACKEND', nombre: 'Backend', grupo: 'CATEGORIA', descripcion: 'Componentes backend', usuario_creacion: 1 },
        { codigo: 'FRONTEND', nombre: 'Frontend', grupo: 'CATEGORIA', descripcion: 'Componentes frontend', usuario_creacion: 1 },
        { codigo: 'DATABASE', nombre: 'Base de Datos', grupo: 'CATEGORIA', descripcion: 'BD', usuario_creacion: 1 },
        { codigo: 'NFS', nombre: 'NFS', grupo: 'CATEGORIA', descripcion: 'NFS', usuario_creacion: 1 },
        { codigo: 'BLOCKCHAIN', nombre: 'Blockchain', grupo: 'CATEGORIA', descripcion: 'Blockchain', usuario_creacion: 1 },
        { codigo: 'OTHER', nombre: 'Otro', grupo: 'CATEGORIA', descripcion: 'Otros componentes', usuario_creacion: 1 },

        // TIPO_RESPALDO
        { codigo: 'CITE', nombre: 'Cite', grupo: 'TIPO_RESPALDO', descripcion: 'Respaldo por CITE', usuario_creacion: 1 },
        { codigo: 'TICKET', nombre: 'Ticket', grupo: 'TIPO_RESPALDO', descripcion: 'Respaldo por ticket', usuario_creacion: 1 },
        { codigo: 'EMAIL', nombre: 'Email', grupo: 'TIPO_RESPALDO', descripcion: 'Respaldo email', usuario_creacion: 1 },

        // E_EVENTO_DESPLIEGUE
        { codigo: 'INICIADO', nombre: 'Iniciado', grupo: 'E_EVENTO_DESPLIEGUE', descripcion: 'Despliegue iniciado', usuario_creacion: 1 },
        { codigo: 'FINALIZADO', nombre: 'Finalizado', grupo: 'E_EVENTO_DESPLIEGUE', descripcion: 'Despliegue finalizado', usuario_creacion: 1 },

        // COMP_TECH
        { codigo: 'BACKEND_1', nombre: 'Node', grupo: 'COMP_TECH', descripcion: 'Node.js', usuario_creacion: 1 },
        { codigo: 'BACKEND_2', nombre: 'RabbitMQ', grupo: 'COMP_TECH', descripcion: 'RabbitMQ', usuario_creacion: 1 },
        { codigo: 'BD_1', nombre: 'PostgreSQL', grupo: 'COMP_TECH', descripcion: 'PostgreSQL', usuario_creacion: 1 },
        { codigo: 'BD_2', nombre: 'MongoDB', grupo: 'COMP_TECH', descripcion: 'MongoDB', usuario_creacion: 1 },
        { codigo: 'BD_3', nombre: 'MySQL/MariaDB', grupo: 'COMP_TECH', descripcion: 'MySQL/MariaDB', usuario_creacion: 1 },
        { codigo: 'FRONTEND_1', nombre: 'React', grupo: 'COMP_TECH', descripcion: 'React', usuario_creacion: 1 },

        // ROL_CLUSTER → grupo debe ser NODO_ROL
        { codigo: 'NM', nombre: 'Master', grupo: 'NODO_ROL', descripcion: 'Nodo master', usuario_creacion: 1 },
        { codigo: 'NW', nombre: 'Worker', grupo: 'NODO_ROL', descripcion: 'Nodo worker', usuario_creacion: 1 },
      ],
      skipDuplicates: true,
    })

    // ============================================================
    // 2. USUARIOS
    // ============================================================
    await db.usuario.createMany({
      data: [
        { nombre_usuario: 'admin', nro_documento: '1234567', nombres: 'Administrador', primer_apellido: 'Sistema', segundo_apellido: 'Principal', celular: '77712345', email: 'admin@infra.com', estado: 'ACTIVO', usuario_creacion: 1 },
        { nombre_usuario: 'pticona', nro_documento: '9093411', nombres: 'Primo', primer_apellido: 'Ticona', segundo_apellido: 'Callizaya', celular: '68157483', email: 'ticonad19@gmail.com', estado: 'ACTIVO',usuario_creacion: 1 },
        { nombre_usuario: 'mgarcia', nro_documento: '1122334', nombres: 'Maria', primer_apellido: 'Garcia', segundo_apellido: 'Lopez', celular: '77711223', email: 'maria.garcia@infra.com', estado: 'ACTIVO',usuario_creacion: 1 },
        { nombre_usuario: 'crodriguez', nro_documento: '4433221', nombres: 'Carlos', primer_apellido: 'Rodriguez', segundo_apellido: 'Martinez', celular: '77744332', email: 'carlos.rodriguez@infra.com', estado: 'ACTIVO',usuario_creacion: 1 },
        { nombre_usuario: 'lfernandez', nro_documento: '5566778', nombres: 'Laura', primer_apellido: 'Fernandez', segundo_apellido: 'Silva', celular: '77755667', email: 'laura.fernandez@infra.com', estado: 'ACTIVO',usuario_creacion: 1 },
      ],
      skipDuplicates: true,
    })

    // ============================================================
    // 3. ROLES
    // ============================================================
    await db.role.createMany({
      data: [
        { nombre: 'Administrador Sistema', cod_tipo_rol: 'ADMIN', descripcion: 'Administrador del sistema', estado: 'ACTIVO',usuario_creacion: 1 },
        { nombre: 'Desarrollador', cod_tipo_rol: 'DEV', descripcion: 'Desarrollador aplicaciones', estado: 'ACTIVO',usuario_creacion: 1 },
        { nombre: 'Operador', cod_tipo_rol: 'OPER', descripcion: 'Operador infraestructura', estado: 'ACTIVO',usuario_creacion: 1 },
        { nombre: 'Usuario Final', cod_tipo_rol: 'USER', descripcion: 'Usuario del sistema', estado: 'ACTIVO',usuario_creacion: 1 },
      ],
      skipDuplicates: true,
    })

    // ============================================================
    // 4. ENTIDADES
    // ============================================================
    await db.entidad.createMany({
      data: [
        { codigo: 'ENT001', sigla: 'MINSALUD', nombre: 'Ministerio de Salud', estado: 'ACTIVO',usuario_creacion: 1 },
        { codigo: 'ENT002', sigla: 'MINEDU', nombre: 'Ministerio de Educación', estado: 'ACTIVO',usuario_creacion: 1 },
        { codigo: 'ENT003', sigla: 'MINTRA', nombre: 'Ministerio de Trabajo', estado: 'ACTIVO',usuario_creacion: 1 },
        { codigo: 'ENT004', sigla: 'MINECO', nombre: 'Ministerio de Economía', estado: 'ACTIVO',usuario_creacion: 1 },
        { codigo: 'ENT005', sigla: 'AGETIC', nombre: 'Agencia de Gobierno Electrónico', estado: 'ACTIVO',usuario_creacion: 1 },
      ],
      skipDuplicates: true,
    })

    // Obtener IDs generados
    const entidades = await db.entidad.findMany()
    const ent1 = entidades.find(e => e.codigo === 'ENT001')
    const ent2 = entidades.find(e => e.codigo === 'ENT002')
    const ent3 = entidades.find(e => e.codigo === 'ENT003')
    const ent4 = entidades.find(e => e.codigo === 'ENT004')
    const ent5 = entidades.find(e => e.codigo === 'ENT005')

    // ============================================================
    // 5. SISTEMAS
    // ============================================================
    await db.sistema.createMany({
      data: [
        { id_entidad: ent1.id, codigo: 'SIS-HC', sigla: 'SISHC', nombre: 'Sistema Historia Clínica', descripcion: 'Sistema integral de historia clínica digital', estado: 'ACTIVO',usuario_creacion: 1 },
        { id_entidad: ent2.id, codigo: 'SIS-EDU', sigla: 'SISEDU', nombre: 'Sistema Educativo Digital', descripcion: 'Plataforma educativa estatal', estado: 'ACTIVO',usuario_creacion: 1 },
        { id_entidad: ent3.id, codigo: 'SIS-TRA', sigla: 'SISTRA', nombre: 'Sistema de Trabajo', descripcion: 'Gestión laboral estatal', estado: 'ACTIVO',usuario_creacion: 1 },
        { id_entidad: ent4.id, codigo: 'SIS-ECO', sigla: 'SISECO', nombre: 'Sistema Económico', descripcion: 'Plataforma económico financiera', estado: 'ACTIVO',usuario_creacion: 1 },
        { id_entidad: ent5.id, codigo: 'SIS-GOB', sigla: 'SISGOB', nombre: 'Sistema Gobierno Electrónico', descripcion: 'Servicios digitales gubernamentales', estado: 'ACTIVO',usuario_creacion: 1 },
      ],
      skipDuplicates: true,
    })

    console.log('✔ Seed ejecutado correctamente')
  } catch (error) {
    console.error(error)
  } finally {
    await db.$disconnect()
  }
}
