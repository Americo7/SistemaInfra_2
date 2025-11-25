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

  scenario('creates a servidor', async (scenario) => {
    const result = await createServidor({
      input: {
        id_hardware: scenario.servidor.two.id_hardware,
        serie_servidor: 'String',
        cod_inventario_agetic: 'String',
        ram: 2820256,
        almacenamiento: 999806,
        estado_operativo: 'String',
        estado: 'ACTIVO',
        usuario_creacion: 5285626,
      },
    })

    expect(result.id_hardware).toEqual(scenario.servidor.two.id_hardware)
    expect(result.serie_servidor).toEqual('String')
    expect(result.cod_inventario_agetic).toEqual('String')
    expect(result.ram).toEqual(2820256)
    expect(result.almacenamiento).toEqual(999806)
    expect(result.estado_operativo).toEqual('String')
    expect(result.estado).toEqual('ACTIVO')
    expect(result.usuario_creacion).toEqual(5285626)
  })

  scenario('updates a servidor', async (scenario) => {
    const original = await servidor({
      id: scenario.servidor.one.id,
    })
    const result = await updateServidor({
      id: original.id,
      input: { serie_servidor: 'String2' },
    })

    expect(result.serie_servidor).toEqual('String2')
  })

  scenario('deletes a servidor', async (scenario) => {
    const original = await deleteServidor({
      id: scenario.servidor.one.id,
    })
    const result = await servidor({ id: original.id })

    expect(result).toEqual(null)
  })
})
