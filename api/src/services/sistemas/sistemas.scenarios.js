export const standard = defineScenario({
  sistema: {
    one: {
      data: {
        codigo: 'String',
        sigla: 'String',
        nombre: 'String',
        descripcion: 'String',
        estado: 'ACTIVO',
        usuario_creacion: 3390488,
        entidades: {
          create: {
            codigo: 'String',
            sigla: 'String',
            nombre: 'String',
            estado: 'ACTIVO',
            usuario_creacion: 9910643,
          },
        },
      },
    },
    two: {
      data: {
        codigo: 'String',
        sigla: 'String',
        nombre: 'String',
        descripcion: 'String',
        estado: 'ACTIVO',
        usuario_creacion: 7932600,
        entidades: {
          create: {
            codigo: 'String',
            sigla: 'String',
            nombre: 'String',
            estado: 'ACTIVO',
            usuario_creacion: 9223429,
          },
        },
      },
    },
  },
})
