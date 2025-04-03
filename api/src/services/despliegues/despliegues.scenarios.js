export const standard = defineScenario({
  despliegue: {
    one: {
      data: {
        cod_tipo_despliegue: 'String',
        es_cluster: true,
        fecha_despliegue: '2025-04-03T16:24:08.138Z',
        estado: 'ACTIVO',
        usuario_creacion: 4120555,
        componentes: {
          create: {
            nombre: 'String',
            dominio: 'String',
            descripcion: 'String',
            cod_entorno: 'String',
            cod_categoria: 'String',
            estado: 'ACTIVO',
            usuario_creacion: 4574628,
            sistemas: {
              create: {
                codigo: 'String',
                sigla: 'String',
                nombre: 'String',
                descripcion: 'String',
                estado: 'ACTIVO',
                usuario_creacion: 2174355,
                entidades: {
                  create: {
                    codigo: 'String',
                    sigla: 'String',
                    nombre: 'String',
                    estado: 'ACTIVO',
                    usuario_creacion: 7683789,
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
            ram: 8352622,
            almacenamiento: { foo: 'bar' },
            cpu: 7542304,
            estado: 'ACTIVO',
            usuario_creacion: 106265,
          },
        },
      },
    },
    two: {
      data: {
        cod_tipo_despliegue: 'String',
        es_cluster: true,
        fecha_despliegue: '2025-04-03T16:24:08.139Z',
        estado: 'ACTIVO',
        usuario_creacion: 6223172,
        componentes: {
          create: {
            nombre: 'String',
            dominio: 'String',
            descripcion: 'String',
            cod_entorno: 'String',
            cod_categoria: 'String',
            estado: 'ACTIVO',
            usuario_creacion: 9064360,
            sistemas: {
              create: {
                codigo: 'String',
                sigla: 'String',
                nombre: 'String',
                descripcion: 'String',
                estado: 'ACTIVO',
                usuario_creacion: 7364500,
                entidades: {
                  create: {
                    codigo: 'String',
                    sigla: 'String',
                    nombre: 'String',
                    estado: 'ACTIVO',
                    usuario_creacion: 2472475,
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
            ram: 2128429,
            almacenamiento: { foo: 'bar' },
            cpu: 4680370,
            estado: 'ACTIVO',
            usuario_creacion: 686916,
          },
        },
      },
    },
  },
})
