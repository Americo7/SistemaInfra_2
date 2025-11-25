import {
  infraAfectadas,
  infraAfectada,
  createInfraAfectada,
  updateInfraAfectada,
  deleteInfraAfectada,
} from './infraAfectadas'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('infraAfectadas', () => {
  scenario('returns all infraAfectadas', async (scenario) => {
    const result = await infraAfectadas()

    expect(result.length).toEqual(Object.keys(scenario.infraAfectada).length)
  })

  scenario('returns a single infraAfectada', async (scenario) => {
    const result = await infraAfectada({ id: scenario.infraAfectada.one.id })

    expect(result).toEqual(scenario.infraAfectada.one)
  })

  scenario('creates a infraAfectada', async (scenario) => {
    const result = await createInfraAfectada({
      input: {
        id_evento: scenario.infraAfectada.two.id_evento,
        estado: 'ACTIVO',
        usuario_creacion: 2465936,
      },
    })

    expect(result.id_evento).toEqual(scenario.infraAfectada.two.id_evento)
    expect(result.estado).toEqual('ACTIVO')
    expect(result.usuario_creacion).toEqual(2465936)
  })

  scenario('updates a infraAfectada', async (scenario) => {
    const original = await infraAfectada({
      id: scenario.infraAfectada.one.id,
    })
    const result = await updateInfraAfectada({
      id: original.id,
      input: { estado: 'INACTIVO' },
    })

    expect(result.estado).toEqual('INACTIVO')
  })

  scenario('deletes a infraAfectada', async (scenario) => {
    const original = await deleteInfraAfectada({
      id: scenario.infraAfectada.one.id,
    })
    const result = await infraAfectada({ id: original.id })

    expect(result).toEqual(null)
  })
})
