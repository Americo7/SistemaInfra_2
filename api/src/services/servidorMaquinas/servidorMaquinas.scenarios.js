export const standard = defineScenario({
  servidorMaquina: {
    one: {
      data: {
        id_maquina: 700225,
        estado: 'ACTIVO',
        usuario_creacion: 6190901,
        maquinas: {
          create: {
            cod_tipo_maquina: 'String',
            nombre: 'String',
            ip: 'String',
            so: 'String',
            ram: 5635152,
            almacenamiento: { foo: 'bar' },
            cpu: 7649666,
            estado: 'ACTIVO',
            usuario_creacion: 8377057,
          },
        },
        servidores: {
          create: {
            serie_servidor: 'String',
            cod_inventario_agetic: 'String',
            ram: 188007,
            almacenamiento: 8133156,
            estado_operativo: 'String',
            estado: 'ACTIVO',
            usuario_creacion: 5598422,
            hardware: {
              create: {
                serie: 'String',
                cod_activo_agetic: 'String',
                cod_tipo_hw: 'String',
                marca: 'String',
                modelo: 'String',
                estado_operativo: 'String',
                estado: 'ACTIVO',
                usuario_creacion: 6840727,
                data_centers: {
                  create: {
                    nombre: 'String',
                    ubicacion: 'String',
                    usuario_creacion: 1994193,
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
        id_maquina: 4069285,
        estado: 'ACTIVO',
        usuario_creacion: 2855302,
        maquinas: {
          create: {
            cod_tipo_maquina: 'String',
            nombre: 'String',
            ip: 'String',
            so: 'String',
            ram: 9999498,
            almacenamiento: { foo: 'bar' },
            cpu: 9615441,
            estado: 'ACTIVO',
            usuario_creacion: 1880541,
          },
        },
        servidores: {
          create: {
            serie_servidor: 'String',
            cod_inventario_agetic: 'String',
            ram: 8274804,
            almacenamiento: 9640598,
            estado_operativo: 'String',
            estado: 'ACTIVO',
            usuario_creacion: 1137675,
            hardware: {
              create: {
                serie: 'String',
                cod_activo_agetic: 'String',
                cod_tipo_hw: 'String',
                marca: 'String',
                modelo: 'String',
                estado_operativo: 'String',
                estado: 'ACTIVO',
                usuario_creacion: 7658503,
                data_centers: {
                  create: {
                    nombre: 'String',
                    ubicacion: 'String',
                    usuario_creacion: 4391496,
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
