import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

export default async () => {
  try {
    console.log('🌱 Iniciando seed...')

    console.log('👤 Insertando usuarios...')

    await db.usuario.create({
      data: {
        id: 1,
        nombre_usuario: 'system',
        nro_documento: '0',
        nombres: 'Sistema',
        primer_apellido: 'Automático',
        segundo_apellido: '',
        celular: '0',
        email: 'system@sis-it',
        estado: 'ACTIVO',
        usuario_creacion: 1,
      },
    })

    const primo = await db.usuario.create({
      data: {
        id: 2,
        nombre_usuario: 'pticona',
        nro_documento: '9093411',
        nombres: 'Primo',
        primer_apellido: 'Ticona',
        segundo_apellido: 'Callizaya',
        celular: '68157483',
        email: 'ticonad19@gmail.com',
        estado: 'ACTIVO',
        usuario_creacion: 1,
      },
    })

    // ============================================================
    // 1. PARAMETROS (parametricas.parametros)
    // ============================================================
    console.log('📌 Insertando parámetros...')

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
        { codigo: 'PXM', nombre: 'Proxmox', grupo: 'TIPO_CLUSTER', descripcion: 'Cluster Proxmox', usuario_creacion: 1 },

        // TIPO_EVENTO
        { codigo: 'INCIDENTE_HW', nombre: 'Incidente Hardware', grupo: 'TIPO_EVENTO', descripcion: 'Incidente hardware', usuario_creacion: 1 },
        { codigo: 'MANT_PROGRAMADO', nombre: 'Mantenimiento Programado', grupo: 'TIPO_EVENTO', descripcion: 'Mantenimiento programado', usuario_creacion: 1 },
        { codigo: 'INCIDENTE_SW', nombre: 'Incidente Software', grupo: 'TIPO_EVENTO', descripcion: 'Incidente software', usuario_creacion: 1 },
        { codigo: 'MANT_NOPROGRAMADO', nombre: 'Mantenimiento No Programado', grupo: 'TIPO_EVENTO', descripcion: 'Mantenimiento no programado', usuario_creacion: 1 },
        { codigo: 'ACTUALIZACION_SW', nombre: 'Actualización Software', grupo: 'TIPO_EVENTO', descripcion: 'Actualización software', usuario_creacion: 1 },
        { codigo: 'ACTUALIZACION_HW', nombre: 'Actualización Hardware', grupo: 'TIPO_EVENTO', descripcion: 'Actualización hardware', usuario_creacion: 1 },
        { codigo: 'CORTE_ENERGIA', nombre: 'Corte Energía', grupo: 'TIPO_EVENTO', descripcion: 'Corte energía eléctrica', usuario_creacion: 1 },

        // ESTADO_OPERATIVO
        { codigo: 'OPERATIVO', nombre: 'Operativo', grupo: 'ESTADO_OPERATIVO', descripcion: 'Estado operativo', usuario_creacion: 1 },
        { codigo: 'MANTENIMIENTO', nombre: 'Mantenimiento', grupo: 'ESTADO_OPERATIVO', descripcion: 'En mantenimiento', usuario_creacion: 1 },
        { codigo: 'FALLA', nombre: 'Falla', grupo: 'ESTADO_OPERATIVO', descripcion: 'En falla', usuario_creacion: 1 },
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

        // ROLES SISTEMA (SI)
        { codigo: 'SI_SUPERADM', nombre: 'Administrador', grupo: 'TIPO_ROL', descripcion: 'Administrador global del sistema', usuario_creacion: 1 },
        { codigo: 'SI_USRADM', nombre: 'Administrador de Usuarios', grupo: 'TIPO_ROL', descripcion: 'Gestiona usuarios y asignación de roles', usuario_creacion: 1 },
        { codigo: 'SI_OPS', nombre: 'Operador de Sistemas', grupo: 'TIPO_ROL', descripcion: 'Operador de infraestructura del sistema', usuario_creacion: 1 },
        { codigo: 'SI_VIEW', nombre: 'Visor Sistema', grupo: 'TIPO_ROL', descripcion: 'Acceso de solo lectura al sistema', usuario_creacion: 1 },

        // ROLES INFRAESTRUCTURA
        { codigo: 'INFRA_ADM', nombre: 'Administrador Infraestructura', grupo: 'TIPO_ROL', descripcion: 'Administra nodos, clusters y recursos', usuario_creacion: 1 },
        { codigo: 'INFRA_OPS', nombre: 'Operador Infraestructura', grupo: 'TIPO_ROL', descripcion: 'Opera recursos de infraestructura', usuario_creacion: 1 },
        { codigo: 'INFRA_VIEW', nombre: 'Visor Infraestructura', grupo: 'TIPO_ROL', descripcion: 'Visualiza infraestructura sin modificar', usuario_creacion: 1 },

        // ROLES SISTEMA OPERATIVO (SO)
        { codigo: 'SO_ROOT', nombre: 'SO Root', grupo: 'TIPO_ROL', descripcion: 'Acceso root al sistema operativo', usuario_creacion: 1 },
        { codigo: 'SO_SUDO', nombre: 'SO Sudo', grupo: 'TIPO_ROL', descripcion: 'Privilegios elevados sin ser root', usuario_creacion: 1 },
        { codigo: 'SO_ADM', nombre: 'SO Admin', grupo: 'TIPO_ROL', descripcion: 'Administrador del sistema operativo', usuario_creacion: 1 },
        { codigo: 'SO_USR', nombre: 'SO User', grupo: 'TIPO_ROL', descripcion: 'Usuario estándar del sistema operativo', usuario_creacion: 1 },

        // ROLES BASE DE DATOS (BD)
        { codigo: 'DB_ADM', nombre: 'DB Admin', grupo: 'TIPO_ROL', descripcion: 'Administrador de base de datos', usuario_creacion: 1 },
        { codigo: 'DB_DEV', nombre: 'DB Developer', grupo: 'TIPO_ROL', descripcion: 'Desarrollador de base de datos', usuario_creacion: 1 },
        { codigo: 'DB_EDIT', nombre: 'DB Editor', grupo: 'TIPO_ROL', descripcion: 'Editor de datos en BD', usuario_creacion: 1 },
        { codigo: 'DB_READ', nombre: 'DB Reader', grupo: 'TIPO_ROL', descripcion: 'Lector de la base de datos', usuario_creacion: 1 },

        // AUDITORÍA
        { codigo: 'AUDITOR', nombre: 'Auditor', grupo: 'TIPO_ROL', descripcion: 'Acceso a auditorías y registros', usuario_creacion: 1 },

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

      { codigo: 'BACKEND_JAVA', nombre: 'Java', grupo: 'COMP_TECH', descripcion: 'Lenguaje Java', usuario_creacion: 1 },
      { codigo: 'BACKEND_PYTHON', nombre: 'Python', grupo: 'COMP_TECH', descripcion: 'Lenguaje Python', usuario_creacion: 1 },
      { codigo: 'BACKEND_GO', nombre: 'Go (Golang)', grupo: 'COMP_TECH', descripcion: 'Lenguaje Go', usuario_creacion: 1 },
      { codigo: 'BACKEND_CSHARP', nombre: 'C# .NET', grupo: 'COMP_TECH', descripcion: 'Lenguaje C#', usuario_creacion: 1 },
      { codigo: 'BACKEND_PHP', nombre: 'PHP', grupo: 'COMP_TECH', descripcion: 'Lenguaje PHP', usuario_creacion: 1 },
      
      // Frameworks Backend
      { codigo: 'BACKEND_NODE', nombre: 'Node.js (Runtime)', grupo: 'COMP_TECH', descripcion: 'Runtime JavaScript', usuario_creacion: 1 },
      { codigo: 'BACKEND_NEST', nombre: 'NestJS', grupo: 'COMP_TECH', descripcion: 'Framework Node.js', usuario_creacion: 1 },
      { codigo: 'BACKEND_EXPRESS', nombre: 'Express.js', grupo: 'COMP_TECH', descripcion: 'Framework Node.js', usuario_creacion: 1 },
      { codigo: 'BACKEND_SPRING', nombre: 'Spring Boot', grupo: 'COMP_TECH', descripcion: 'Framework Java', usuario_creacion: 1 },
      { codigo: 'BACKEND_FASTAPI', nombre: 'FastAPI', grupo: 'COMP_TECH', descripcion: 'Framework Python', usuario_creacion: 1 },
      { codigo: 'BACKEND_DJANGO', nombre: 'Django', grupo: 'COMP_TECH', descripcion: 'Framework Python', usuario_creacion: 1 },
      { codigo: 'BACKEND_LARAVEL', nombre: 'Laravel', grupo: 'COMP_TECH', descripcion: 'Framework PHP', usuario_creacion: 1 },

      // ===========================================
      // CATEGORÍA: FRONTEND (Prefijo: FRONTEND_)
      // ===========================================
      // Lenguajes / Básicos
      { codigo: 'FRONTEND_JS', nombre: 'JavaScript', grupo: 'COMP_TECH', descripcion: 'Estándar JS', usuario_creacion: 1 },
      { codigo: 'FRONTEND_TS', nombre: 'TypeScript', grupo: 'COMP_TECH', descripcion: 'Superset TS', usuario_creacion: 1 },
      
      // Frameworks / Librerías
      { codigo: 'FRONTEND_REACT', nombre: 'React', grupo: 'COMP_TECH', descripcion: 'Librería UI', usuario_creacion: 1 },
      { codigo: 'FRONTEND_NEXT', nombre: 'Next.js', grupo: 'COMP_TECH', descripcion: 'Framework React', usuario_creacion: 1 },
      { codigo: 'FRONTEND_VUE', nombre: 'Vue.js', grupo: 'COMP_TECH', descripcion: 'Framework UI', usuario_creacion: 1 },
      { codigo: 'FRONTEND_NUXT', nombre: 'Nuxt.js', grupo: 'COMP_TECH', descripcion: 'Framework Vue', usuario_creacion: 1 },
      { codigo: 'FRONTEND_ANGULAR', nombre: 'Angular', grupo: 'COMP_TECH', descripcion: 'Framework Google', usuario_creacion: 1 },
      { codigo: 'FRONTEND_TAILWIND', nombre: 'Tailwind CSS', grupo: 'COMP_TECH', descripcion: 'Framework CSS', usuario_creacion: 1 },

      // ===========================================
      // CATEGORÍA: BASE DE DATOS (Prefijo: BD_)
      // ===========================================
      // Relacionales
      { codigo: 'BD_PGSQL', nombre: 'PostgreSQL', grupo: 'COMP_TECH', descripcion: 'RDBMS PostgreSQL', usuario_creacion: 1 },
      { codigo: 'BD_MYSQL', nombre: 'MySQL', grupo: 'COMP_TECH', descripcion: 'RDBMS MySQL', usuario_creacion: 1 },
      { codigo: 'BD_MARIADB', nombre: 'MariaDB', grupo: 'COMP_TECH', descripcion: 'RDBMS MariaDB', usuario_creacion: 1 },
      { codigo: 'BD_ORACLE', nombre: 'Oracle DB', grupo: 'COMP_TECH', descripcion: 'RDBMS Oracle', usuario_creacion: 1 },
      { codigo: 'BD_SQLSERVER', nombre: 'SQL Server', grupo: 'COMP_TECH', descripcion: 'RDBMS Microsoft', usuario_creacion: 1 },
      
      // NoSQL / Cache
      { codigo: 'BD_MONGO', nombre: 'MongoDB', grupo: 'COMP_TECH', descripcion: 'NoSQL Documental', usuario_creacion: 1 },
      { codigo: 'BD_REDIS', nombre: 'Redis', grupo: 'COMP_TECH', descripcion: 'In-Memory Cache', usuario_creacion: 1 },
      { codigo: 'BD_ELASTIC', nombre: 'Elasticsearch', grupo: 'COMP_TECH', descripcion: 'Motor de búsqueda', usuario_creacion: 1 },

      // ===========================================
      // CATEGORÍA: INFRAESTRUCTURA / OTROS (Prefijo: INFRA_ u OTROS_)
      // ===========================================
      // Mensajería
      { codigo: 'INFRA_KAFKA', nombre: 'Apache Kafka', grupo: 'COMP_TECH', descripcion: 'Streaming de eventos', usuario_creacion: 1 },
      { codigo: 'INFRA_RABBIT', nombre: 'RabbitMQ', grupo: 'COMP_TECH', descripcion: 'Message Broker', usuario_creacion: 1 },
      
      // Contenedores / CI/CD
      { codigo: 'INFRA_DOCKER', nombre: 'Docker', grupo: 'COMP_TECH', descripcion: 'Contenedores', usuario_creacion: 1 },
      { codigo: 'INFRA_K8S', nombre: 'Kubernetes', grupo: 'COMP_TECH', descripcion: 'Orquestación', usuario_creacion: 1 },
      { codigo: 'INFRA_NGINX', nombre: 'Nginx', grupo: 'COMP_TECH', descripcion: 'Web Server / Proxy', usuario_creacion: 1 },
        // NODO_ROL
        { codigo: 'NM', nombre: 'Master', grupo: 'NODO_ROL', descripcion: 'Nodo master', usuario_creacion: 1 },
        { codigo: 'NW', nombre: 'Worker', grupo: 'NODO_ROL', descripcion: 'Nodo worker', usuario_creacion: 1 },

        // PLATAFORMA
        { codigo: 'PX', nombre: 'Proxmox', grupo: 'PLATAFORMA', descripcion: 'Plataforma de proxmox', usuario_creacion: 1 },
        { codigo: 'OP', nombre: 'Open Stack', grupo: 'PLATAFORMA', descripcion: 'Plataforma open stack', usuario_creacion: 1 },
      ],
      skipDuplicates: true
    })

    // ============================================================
    // 3. ROLES
    // ============================================================
    console.log('🔐 Insertando roles...')

    await db.role.createMany({
      data: [
        // SI
        { nombre: 'Administrador', cod_tipo_rol: 'SI_SUPERADM', descripcion: 'Administrador global del sistema', estado: 'ACTIVO', usuario_creacion: 1 },
        { nombre: 'Admin de Usuarios', cod_tipo_rol: 'SI_USRADM', descripcion: 'Gestiona usuarios y asignación de roles', estado: 'ACTIVO', usuario_creacion: 1 },
        { nombre: 'Operador de Sistemas', cod_tipo_rol: 'SI_OPS', descripcion: 'Operador de infraestructura del sistema', estado: 'ACTIVO', usuario_creacion: 1 },
        { nombre: 'Visor Sistema', cod_tipo_rol: 'SI_VIEW', descripcion: 'Acceso de solo lectura al sistema', estado: 'ACTIVO', usuario_creacion: 1 },

        // INFRA
        { nombre: 'Administrador Infraestructura', cod_tipo_rol: 'INFRA_ADM', descripcion: 'Administra nodos, clusters y recursos', estado: 'ACTIVO', usuario_creacion: 1 },
        { nombre: 'Operador Infraestructura', cod_tipo_rol: 'INFRA_OPS', descripcion: 'Opera recursos de infraestructura', estado: 'ACTIVO', usuario_creacion: 1 },
        { nombre: 'Visor Infraestructura', cod_tipo_rol: 'INFRA_VIEW', descripcion: 'Visualiza infraestructura sin modificar', estado: 'ACTIVO', usuario_creacion: 1 },

        // SO
        { nombre: 'Root SO', cod_tipo_rol: 'SO_ROOT', descripcion: 'Acceso root al sistema operativo', estado: 'ACTIVO', usuario_creacion: 1 },
        { nombre: 'Sudo SO', cod_tipo_rol: 'SO_SUDO', descripcion: 'Privilegios elevados sin ser root', estado: 'ACTIVO', usuario_creacion: 1 },
        { nombre: 'Administrador SO', cod_tipo_rol: 'SO_ADM', descripcion: 'Administrador del sistema operativo', estado: 'ACTIVO', usuario_creacion: 1 },
        { nombre: 'Usuario SO', cod_tipo_rol: 'SO_USR', descripcion: 'Usuario estándar del sistema operativo', estado: 'ACTIVO', usuario_creacion: 1 },

        // DB
        { nombre: 'Administrador BD', cod_tipo_rol: 'DB_ADM', descripcion: 'Administrador de base de datos', estado: 'ACTIVO', usuario_creacion: 1 },
        { nombre: 'Desarrollador BD', cod_tipo_rol: 'DB_DEV', descripcion: 'Desarrollador de base de datos', estado: 'ACTIVO', usuario_creacion: 1 },
        { nombre: 'Editor BD', cod_tipo_rol: 'DB_EDIT', descripcion: 'Editor de datos de base de datos', estado: 'ACTIVO', usuario_creacion: 1 },
        { nombre: 'Lector BD', cod_tipo_rol: 'DB_READ', descripcion: 'Lector de la base de datos', estado: 'ACTIVO', usuario_creacion: 1 },

        // Auditor
        { nombre: 'Auditor', cod_tipo_rol: 'AUDITOR', descripcion: 'Acceso a auditorías y registros del sistema', estado: 'ACTIVO', usuario_creacion: 1 },
      ],
      skipDuplicates: true
    })

    const rolAdmin = await db.role.findFirst({
      where: { cod_tipo_rol: 'SI_SUPERADM' },
    })

    // ============================================================
    // 4. ENTIDADES
    // ============================================================
    await db.entidad.create({
      data: {
        codigo: 'ENT001',
        sigla: 'AGETIC',
        nombre: 'Agencia de Gobierno Electrónico y Tecnologías de Información y Comunicación',
        estado: 'ACTIVO',
        usuario_creacion: 1,
      },
    })

    const ent = await db.entidad.findFirst({
      where: { codigo: 'ENT001' },
    })

    // ============================================================
    // 5. SISTEMAS
    // ============================================================
    await db.sistema.create({
      data: {
        id_entidad: ent.id,
        codigo: 'SIS-IT',
        sigla: 'SIAIT',
        nombre: 'Sistema de Inventariado y Administración de Infraestructura Tecnológica',
        descripcion: 'Sistema de inventariado y gestión de infraestructura tecnológica',
        estado: 'ACTIVO',
        usuario_creacion: 1,
      },
    })

    const sistemaIT = await db.sistema.findFirst({
      where: { codigo: 'SIS-IT' },
    })

    // ============================================================
    // 6. ASIGNACIÓN ROL ADMIN A PRIMO
    // ============================================================
    await db.usuarioRol.create({
      data: {
        id_usuario: 2,           // Primo
        id_rol: rolAdmin.id,     // Rol Admin real
        id_sistema: sistemaIT.id, 
        estado: 'ACTIVO',
        usuario_creacion: 1,
      },
    })

    await db.$executeRawUnsafe(
      `SELECT setval(
        pg_get_serial_sequence('registro.usuarios', 'id'),
        (SELECT COALESCE(MAX(id), 0) FROM registro.usuarios),
        true
      );`
    );
    console.log('✔ Seed ejecutado correctamente')
  } catch (error) {
    console.error(error)
  } finally {
    await db.$disconnect()
  }
}