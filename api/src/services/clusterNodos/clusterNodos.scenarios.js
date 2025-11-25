export const standard = defineScenario({
  clusterNodo: {
    one: {
      data: {
        nombre: 'String',
        nodoTipo: 'String',
        estado: 'ACTIVO',
        usuario_creacion: 1535066,
        cluster: {
          create: {
            nombre: 'String',
            cod_tipo_cluster: 'String',
            descripcion: 'String',
            estado: 'ACTIVO',
            usuario_creacion: 1865854,
          },
        },
      },
    },
    two: {
      data: {
        nombre: 'String',
        nodoTipo: 'String',
        estado: 'ACTIVO',
        usuario_creacion: 8195558,
        cluster: {
          create: {
            nombre: 'String',
            cod_tipo_cluster: 'String',
            descripcion: 'String',
            estado: 'ACTIVO',
            usuario_creacion: 6459184,
          },
        },
      },
    },
  },
})
