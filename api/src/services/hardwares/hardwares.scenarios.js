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
        usuario_creacion: 489679,
        data_centers: {
          create: {
            nombre: 'String',
            ubicacion: 'String',
            usuario_creacion: 85712,
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
        usuario_creacion: 8351971,
        data_centers: {
          create: {
            nombre: 'String',
            ubicacion: 'String',
            usuario_creacion: 3631864,
          },
        },
      },
    },
  },
})
