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
        cod_tipo_despliegue: 'String',
        es_cluster: true,
        fecha_despliegue: '2025-04-03T16:24:08.090Z',
        estado: 'ACTIVO',
        usuario_creacion: 5023161,
      },
    })

    expect(result.id_componente).toEqual(scenario.despliegue.two.id_componente)
    expect(result.id_maquina).toEqual(scenario.despliegue.two.id_maquina)
    expect(result.cod_tipo_despliegue).toEqual('String')
    expect(result.es_cluster).toEqual(true)
    expect(result.fecha_despliegue).toEqual(
      new Date('2025-04-03T16:24:08.090Z')
    )
    expect(result.estado).toEqual('ACTIVO')
    expect(result.usuario_creacion).toEqual(5023161)
  })

  scenario('updates a despliegue', async (scenario) => {
    const original = await despliegue({
      id: scenario.despliegue.one.id,
    })
    const result = await updateDespliegue({
      id: original.id,
      input: { cod_tipo_despliegue: 'String2' },
    })

    expect(result.cod_tipo_despliegue).toEqual('String2')
  })

  scenario('deletes a despliegue', async (scenario) => {
    const original = await deleteDespliegue({
      id: scenario.despliegue.one.id,
    })
    const result = await despliegue({ id: original.id })

    expect(result).toEqual(null)
  })
})
