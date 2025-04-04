export const standard = defineScenario({
  hardware: {
    one: {
      data: {
        serie: 'String',
        cod_activo_agetic: 'String',
        cod_tipo_hw: 'String',
        marca: 'String',
        modelo: 'String',
        estado_operativo: 'String',
        estado: 'ACTIVO',
        usuario_creacion: 3331487,
        data_centers: {
          create: {
            nombre: 'String',
            ubicacion: 'String',
            usuario_creacion: 876620,
          },
        },
      },
    },
    two: {
      data: {
        serie: 'String',
        cod_activo_agetic: 'String',
        cod_tipo_hw: 'String',
        marca: 'String',
        modelo: 'String',
        estado_operativo: 'String',
        estado: 'ACTIVO',
        usuario_creacion: 8287306,
        data_centers: {
          create: {
            nombre: 'String',
            ubicacion: 'String',
            usuario_creacion: 6129464,
          },
        },
      },
    },
  },
})
