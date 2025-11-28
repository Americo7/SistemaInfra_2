import {
  servidors,
  servidor,
  createServidor,
  updateServidor,
  deleteServidor,
} from './servidors'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('servidors', () => {
  scenario('returns all servidors', async (scenario) => {
    const result = await servidors()

    expect(result.length).toEqual(Object.keys(scenario.servidor).length)
  })

  scenario('returns a single servidor', async (scenario) => {
    const result = await servidor({ id: scenario.servidor.one.id })

    expect(result).toEqual(scenario.servidor.one)
  })

  scenario('creates a servidor', async () => {
    const result = await createServidor({
      input: {
        nombre: 'String',
        estado_operativo: 'String',
        estado: 'ACTIVO',
        usuario_creacion: 3848806,
      },
    })

    expect(result.nombre).toEqual('String')
    expect(result.estado_operativo).toEqual('String')
    expect(result.estado).toEqual('ACTIVO')
    expect(result.usuario_creacion).toEqual(3848806)
  })

  scenario('updates a servidor', async (scenario) => {
    const original = await servidor({
      id: scenario.servidor.one.id,
    })
    const result = await updateServidor({
      id: original.id,
      input: { nombre: 'String2' },
    })

    expect(result.nombre).toEqual('String2')
  })

  scenario('deletes a servidor', async (scenario) => {
    const original = await deleteServidor({
      id: scenario.servidor.one.id,
    })
    const result = await servidor({ id: original.id })

    expect(result).toEqual(null)
  })
})
