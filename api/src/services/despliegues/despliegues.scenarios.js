export const standard = defineScenario({
  despliegue: {
    one: {
      data: {
        fecha_despliegue: '2025-04-04T12:50:57.346Z',
        estado: 'ACTIVO',
        usuario_creacion: 8010923,
        fecha_solicitud: '2025-04-04T12:50:57.346Z',
        unidad_solicitante: 'String',
        solicitante: 'String',
        cod_tipo_respaldo: 'String',
        referencia_respaldo: 'String',
        estado_despliegue: 'String',
        componentes: {
          create: {
            nombre: 'String',
            dominio: 'String',
            descripcion: 'String',
            cod_entorno: 'String',
            cod_categoria: 'String',
            estado: 'ACTIVO',
            usuario_creacion: 3471818,
            sistemas: {
              create: {
                codigo: 'String',
                sigla: 'String',
                nombre: 'String',
                descripcion: 'String',
                estado: 'ACTIVO',
                usuario_creacion: 5641119,
                entidades: {
                  create: {
                    codigo: 'String',
                    sigla: 'String',
                    nombre: 'String',
                    estado: 'ACTIVO',
                    usuario_creacion: 1235708,
                  },
                },
              },
            },
          },
        },
        maquinas: {
          create: {
            cod_tipo_maquina: 'String',
            nombre: 'String',
            ip: 'String',
            so: 'String',
            ram: 4201373,
            almacenamiento: { foo: 'bar' },
            cpu: 6812786,
            estado: 'ACTIVO',
            usuario_creacion: 2316974,
          },
        },
      },
    },
    two: {
      data: {
        fecha_despliegue: '2025-04-04T12:50:57.346Z',
        estado: 'ACTIVO',
        usuario_creacion: 4031394,
        fecha_solicitud: '2025-04-04T12:50:57.346Z',
        unidad_solicitante: 'String',
        solicitante: 'String',
        cod_tipo_respaldo: 'String',
        referencia_respaldo: 'String',
        estado_despliegue: 'String',
        componentes: {
          create: {
            nombre: 'String',
            dominio: 'String',
            descripcion: 'String',
            cod_entorno: 'String',
            cod_categoria: 'String',
            estado: 'ACTIVO',
            usuario_creacion: 8971714,
            sistemas: {
              create: {
                codigo: 'String',
                sigla: 'String',
                nombre: 'String',
                descripcion: 'String',
                estado: 'ACTIVO',
                usuario_creacion: 9126989,
                entidades: {
                  create: {
                    codigo: 'String',
                    sigla: 'String',
                    nombre: 'String',
                    estado: 'ACTIVO',
                    usuario_creacion: 5661445,
                  },
                },
              },
            },
          },
        },
        maquinas: {
          create: {
            cod_tipo_maquina: 'String',
            nombre: 'String',
            ip: 'String',
            so: 'String',
            ram: 2464792,
            almacenamiento: { foo: 'bar' },
            cpu: 3631519,
            estado: 'ACTIVO',
            usuario_creacion: 8134903,
          },
        },
      },
    },
  },
})
