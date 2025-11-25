export const standard = defineScenario({
  despliegueBitacora: {
    one: {
      data: {
        estado_anterior: 'String',
        estado_actual: 'String',
        usuario_creacion: 611531,
        despliegue: {
          create: {
            fecha_despliegue: '2025-04-04T12:51:55.973Z',
            estado: 'ACTIVO',
            usuario_creacion: 5940826,
            fecha_solicitud: '2025-04-04T12:51:55.973Z',
            unidad_solicitante: 'String',
            solicitante: 'String',
            cod_tipo_respaldo: 'String',
            referencia_respaldo: 'String',
            estado_despliegue: 'String',
            componentes: {
              create: {
                nombre: 'String',
                dominio: 'String',
                descripcion: 'String',
                cod_entorno: 'String',
                cod_categoria: 'String',
                estado: 'ACTIVO',
                usuario_creacion: 5170707,
                sistemas: {
                  create: {
                    codigo: 'String',
                    sigla: 'String',
                    nombre: 'String',
                    descripcion: 'String',
                    estado: 'ACTIVO',
                    usuario_creacion: 6855687,
                    entidades: {
                      create: {
                        codigo: 'String',
                        sigla: 'String',
                        nombre: 'String',
                        estado: 'ACTIVO',
                        usuario_creacion: 6963698,
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
                ram: 6558168,
                almacenamiento: { foo: 'bar' },
                cpu: 1785124,
                estado: 'ACTIVO',
                usuario_creacion: 642754,
              },
            },
          },
        },
      },
    },
    two: {
      data: {
        estado_anterior: 'String',
        estado_actual: 'String',
        usuario_creacion: 5974680,
        despliegue: {
          create: {
            fecha_despliegue: '2025-04-04T12:51:55.973Z',
            estado: 'ACTIVO',
            usuario_creacion: 1856441,
            fecha_solicitud: '2025-04-04T12:51:55.973Z',
            unidad_solicitante: 'String',
            solicitante: 'String',
            cod_tipo_respaldo: 'String',
            referencia_respaldo: 'String',
            estado_despliegue: 'String',
            componentes: {
              create: {
                nombre: 'String',
                dominio: 'String',
                descripcion: 'String',
                cod_entorno: 'String',
                cod_categoria: 'String',
                estado: 'ACTIVO',
                usuario_creacion: 6740267,
                sistemas: {
                  create: {
                    codigo: 'String',
                    sigla: 'String',
                    nombre: 'String',
                    descripcion: 'String',
                    estado: 'ACTIVO',
                    usuario_creacion: 4507218,
                    entidades: {
                      create: {
                        codigo: 'String',
                        sigla: 'String',
                        nombre: 'String',
                        estado: 'ACTIVO',
                        usuario_creacion: 6389571,
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
                ram: 8602610,
                almacenamiento: { foo: 'bar' },
                cpu: 9475115,
                estado: 'ACTIVO',
                usuario_creacion: 9073603,
              },
            },
          },
        },
      },
    },
  },
})
