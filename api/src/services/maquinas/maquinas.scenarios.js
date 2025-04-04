export const standard = defineScenario({
  maquina: {
    one: {
      data: {
        cod_tipo_maquina: 'String',
        nombre: 'String',
        ip: 'String',
        so: 'String',
        ram: 8925000,
        almacenamiento: { foo: 'bar' },
        cpu: 3000366,
        estado: 'ACTIVO',
        usuario_creacion: 9946171,
      },
    },
    two: {
      data: {
        cod_tipo_maquina: 'String',
        nombre: 'String',
        ip: 'String',
        so: 'String',
        ram: 7321812,
        almacenamiento: { foo: 'bar' },
        cpu: 1565851,
        estado: 'ACTIVO',
        usuario_creacion: 295232,
      },
    },
  },
})
