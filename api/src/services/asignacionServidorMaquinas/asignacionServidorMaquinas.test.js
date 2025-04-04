import {
  asignacionServidorMaquinas,
  asignacionServidorMaquina,
  createAsignacionServidorMaquina,
  updateAsignacionServidorMaquina,
  deleteAsignacionServidorMaquina,
} from './asignacionServidorMaquinas'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('asignacionServidorMaquinas', () => {
  scenario('returns all asignacionServidorMaquinas', async (scenario) => {
    const result = await asignacionServidorMaquinas()

    expect(result.length).toEqual(
      Object.keys(scenario.asignacionServidorMaquina).length
    )
  })

  scenario('returns a single asignacionServidorMaquina', async (scenario) => {
    const result = await asignacionServidorMaquina({
      id: scenario.asignacionServidorMaquina.one.id,
    })

    expect(result).toEqual(scenario.asignacionServidorMaquina.one)
  })

  scenario('creates a asignacionServidorMaquina', async (scenario) => {
    const result = await createAsignacionServidorMaquina({
      input: {
        id_servidor: scenario.asignacionServidorMaquina.two.id_servidor,
        id_maquina: scenario.asignacionServidorMaquina.two.id_maquina,
        estado: 'ACTIVO',
        usuario_creacion: 423755,
      },
    })

    expect(result.id_servidor).toEqual(
      scenario.asignacionServidorMaquina.two.id_servidor
    )
    expect(result.id_maquina).toEqual(
      scenario.asignacionServidorMaquina.two.id_maquina
    )
    expect(result.estado).toEqual('ACTIVO')
    expect(result.usuario_creacion).toEqual(423755)
  })

  scenario('updates a asignacionServidorMaquina', async (scenario) => {
    const original = await asignacionServidorMaquina({
      id: scenario.asignacionServidorMaquina.one.id,
    })
    const result = await updateAsignacionServidorMaquina({
      id: original.id,
      input: { estado: 'INACTIVO' },
    })

    expect(result.estado).toEqual('INACTIVO')
  })

  scenario('deletes a asignacionServidorMaquina', async (scenario) => {
    const original = await deleteAsignacionServidorMaquina({
      id: scenario.asignacionServidorMaquina.one.id,
    })
    const result = await asignacionServidorMaquina({ id: original.id })

    expect(result).toEqual(null)
  })
})
