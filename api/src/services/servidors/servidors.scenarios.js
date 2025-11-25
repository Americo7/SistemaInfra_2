export const standard = defineScenario({
  servidor: {
    one: {
      data: {
        serie_servidor: 'String',
        cod_inventario_agetic: 'String',
        ram: 1553909,
        almacenamiento: 4465118,
        estado_operativo: 'String',
        estado: 'ACTIVO',
        usuario_creacion: 3195518,
        hardware: {
          create: {
            serie: 'String',
            cod_activo_agetic: 'String',
            cod_tipo_hw: 'String',
            marca: 'String',
            modelo: 'String',
            estado_operativo: 'String',
            estado: 'ACTIVO',
            usuario_creacion: 9414980,
            data_centers: {
              create: {
                nombre: 'String',
                ubicacion: 'String',
                usuario_creacion: 3055134,
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
        ram: 3620302,
        almacenamiento: 7730194,
        estado_operativo: 'String',
        estado: 'ACTIVO',
        usuario_creacion: 3294858,
        hardware: {
          create: {
            serie: 'String',
            cod_activo_agetic: 'String',
            cod_tipo_hw: 'String',
            marca: 'String',
            modelo: 'String',
            estado_operativo: 'String',
            estado: 'ACTIVO',
            usuario_creacion: 3260371,
            data_centers: {
              create: {
                nombre: 'String',
                ubicacion: 'String',
                usuario_creacion: 4572342,
              },
            },
          },
        },
      },
    },
  },
})
