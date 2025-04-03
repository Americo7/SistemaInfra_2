export const standard = defineScenario({
  servidor: {
    one: {
      data: {
        serie_servidor: 'String',
        cod_inventario_agetic: 'String',
        ram: 1993833,
        almacenamiento: 8181598,
        estado_operativo: 'String',
        estado: 'ACTIVO',
        usuario_creacion: 2694476,
        hardware: {
          create: {
            serie: 'String',
            cod_activo_agetic: 'String',
            cod_tipo_hw: 'String',
            marca: 'String',
            modelo: 'String',
            estado_operativo: 'String',
            estado: 'ACTIVO',
            usuario_creacion: 1964676,
            data_centers: {
              create: {
                nombre: 'String',
                ubicacion: 'String',
                usuario_creacion: 1282531,
              },
            },
          },
        },
      },
    },
    two: {
      data: {
        serie_servidor: 'String',
        cod_inventario_agetic: 'String',
        ram: 5572258,
        almacenamiento: 2011947,
        estado_operativo: 'String',
        estado: 'ACTIVO',
        usuario_creacion: 2964784,
        hardware: {
          create: {
            serie: 'String',
            cod_activo_agetic: 'String',
            cod_tipo_hw: 'String',
            marca: 'String',
            modelo: 'String',
            estado_operativo: 'String',
            estado: 'ACTIVO',
            usuario_creacion: 1369836,
            data_centers: {
              create: {
                nombre: 'String',
                ubicacion: 'String',
                usuario_creacion: 7025136,
              },
            },
          },
        },
      },
    },
  },
})
