import {
  despliegues,
  despliegue,
  createDespliegue,
  updateDespliegue,
  deleteDespliegue,
} from './despliegues'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('despliegues', () => {
  scenario('returns all despliegues', async (scenario) => {
    const result = await despliegues()

    expect(result.length).toEqual(Object.keys(scenario.despliegue).length)
  })

  scenario('returns a single despliegue', async (scenario) => {
    const result = await despliegue({ id: scenario.despliegue.one.id })

    expect(result).toEqual(scenario.despliegue.one)
  })

  scenario('creates a despliegue', async (scenario) => {
    const result = await createDespliegue({
      input: {
        id_componente: scenario.despliegue.two.id_componente,
        id_maquina: scenario.despliegue.two.id_maquina,
        fecha_despliegue: '2025-04-04T12:50:57.321Z',
        estado: 'ACTIVO',
        usuario_creacion: 8294855,
        fecha_solicitud: '2025-04-04T12:50:57.321Z',
        unidad_solicitante: 'String',
        solicitante: 'String',
        cod_tipo_respaldo: 'String',
        referencia_respaldo: 'String',
        estado_despliegue: 'String',
      },
    })

    expect(result.id_componente).toEqual(scenario.despliegue.two.id_componente)
    expect(result.id_maquina).toEqual(scenario.despliegue.two.id_maquina)
    expect(result.fecha_despliegue).toEqual(
      new Date('2025-04-04T12:50:57.321Z')
    )
    expect(result.estado).toEqual('ACTIVO')
    expect(result.usuario_creacion).toEqual(8294855)
    expect(result.fecha_solicitud).toEqual(new Date('2025-04-04T12:50:57.321Z'))
    expect(result.unidad_solicitante).toEqual('String')
    expect(result.solicitante).toEqual('String')
    expect(result.cod_tipo_respaldo).toEqual('String')
    expect(result.referencia_respaldo).toEqual('String')
    expect(result.estado_despliegue).toEqual('String')
  })

  scenario('updates a despliegue', async (scenario) => {
    const original = await despliegue({
      id: scenario.despliegue.one.id,
    })
    const result = await updateDespliegue({
      id: original.id,
      input: { fecha_despliegue: '2025-04-05T12:50:57.321Z' },
    })

    expect(result.fecha_despliegue).toEqual(
      new Date('2025-04-05T12:50:57.321Z')
    )
  })

  scenario('deletes a despliegue', async (scenario) => {
    const original = await deleteDespliegue({
      id: scenario.despliegue.one.id,
    })
    const result = await despliegue({ id: original.id })

    expect(result).toEqual(null)
  })
})
