import {
  servidorMaquinas,
  servidorMaquina,
  createServidorMaquina,
  updateServidorMaquina,
  deleteServidorMaquina,
} from './servidorMaquinas'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('servidorMaquinas', () => {
  scenario('returns all servidorMaquinas', async (scenario) => {
    const result = await servidorMaquinas()

    expect(result.length).toEqual(Object.keys(scenario.servidorMaquina).length)
  })

  scenario('returns a single servidorMaquina', async (scenario) => {
    const result = await servidorMaquina({
      id: scenario.servidorMaquina.one.id,
    })

    expect(result).toEqual(scenario.servidorMaquina.one)
  })

  scenario('creates a servidorMaquina', async (scenario) => {
    const result = await createServidorMaquina({
      input: {
        id_servidor: scenario.servidorMaquina.two.id_servidor,
        id_maquina: 4711699,
        estado: 'ACTIVO',
        usuario_creacion: 3580492,
      },
    })

    expect(result.id_servidor).toEqual(scenario.servidorMaquina.two.id_servidor)
    expect(result.id_maquina).toEqual(4711699)
    expect(result.estado).toEqual('ACTIVO')
    expect(result.usuario_creacion).toEqual(3580492)
  })

  scenario('updates a servidorMaquina', async (scenario) => {
    const original = await servidorMaquina({
      id: scenario.servidorMaquina.one.id,
    })
    const result = await updateServidorMaquina({
      id: original.id,
      input: { id_maquina: 5157234 },
    })

    expect(result.id_maquina).toEqual(5157234)
  })

  scenario('deletes a servidorMaquina', async (scenario) => {
    const original = await deleteServidorMaquina({
      id: scenario.servidorMaquina.one.id,
    })
    const result = await servidorMaquina({ id: original.id })

    expect(result).toEqual(null)
  })
})
