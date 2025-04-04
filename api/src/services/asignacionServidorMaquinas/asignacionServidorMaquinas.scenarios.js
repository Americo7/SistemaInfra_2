export const standard = defineScenario({
  asignacionServidorMaquina: {
    one: {
      data: {
        estado: 'ACTIVO',
        usuario_creacion: 7543374,
        maquinas: {
          create: {
            cod_tipo_maquina: 'String',
            nombre: 'String',
            ip: 'String',
            so: 'String',
            ram: 2541706,
            almacenamiento: { foo: 'bar' },
            cpu: 9200348,
            estado: 'ACTIVO',
            usuario_creacion: 8031827,
          },
        },
        servidores: {
          create: {
            serie_servidor: 'String',
            cod_inventario_agetic: 'String',
            ram: 9619403,
            almacenamiento: 6448045,
            estado_operativo: 'String',
            estado: 'ACTIVO',
            usuario_creacion: 7588985,
            hardware: {
              create: {
                serie: 'String',
                cod_activo_agetic: 'String',
                cod_tipo_hw: 'String',
                marca: 'String',
                modelo: 'String',
                estado_operativo: 'String',
                estado: 'ACTIVO',
                usuario_creacion: 3500965,
                data_centers: {
                  create: {
                    nombre: 'String',
                    ubicacion: 'String',
                    usuario_creacion: 929031,
                  },
                },
              },
            },
          },
        },
      },
    },
    two: {
      data: {
        estado: 'ACTIVO',
        usuario_creacion: 5848907,
        maquinas: {
          create: {
            cod_tipo_maquina: 'String',
            nombre: 'String',
            ip: 'String',
            so: 'String',
            ram: 3881323,
            almacenamiento: { foo: 'bar' },
            cpu: 8442834,
            estado: 'ACTIVO',
            usuario_creacion: 1850249,
          },
        },
        servidores: {
          create: {
            serie_servidor: 'String',
            cod_inventario_agetic: 'String',
            ram: 6116848,
            almacenamiento: 6774375,
            estado_operativo: 'String',
            estado: 'ACTIVO',
            usuario_creacion: 268756,
            hardware: {
              create: {
                serie: 'String',
                cod_activo_agetic: 'String',
                cod_tipo_hw: 'String',
                marca: 'String',
                modelo: 'String',
                estado_operativo: 'String',
                estado: 'ACTIVO',
                usuario_creacion: 3959655,
                data_centers: {
                  create: {
                    nombre: 'String',
                    ubicacion: 'String',
                    usuario_creacion: 6768594,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
})
