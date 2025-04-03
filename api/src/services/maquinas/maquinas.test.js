import {
  maquinas,
  maquina,
  createMaquina,
  updateMaquina,
  deleteMaquina,
} from './maquinas'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('maquinas', () => {
  scenario('returns all maquinas', async (scenario) => {
    const result = await maquinas()

    expect(result.length).toEqual(Object.keys(scenario.maquina).length)
  })

  scenario('returns a single maquina', async (scenario) => {
    const result = await maquina({ id: scenario.maquina.one.id })

    expect(result).toEqual(scenario.maquina.one)
  })

  scenario('creates a maquina', async () => {
    const result = await createMaquina({
      input: {
        cod_tipo_maquina: 'String',
        nombre: 'String',
        ip: 'String',
        so: 'String',
        ram: 8949152,
        almacenamiento: { foo: 'bar' },
        cpu: 7071063,
        estado: 'ACTIVO',
        usuario_creacion: 6308827,
      },
    })

    expect(result.cod_tipo_maquina).toEqual('String')
    expect(result.nombre).toEqual('String')
    expect(result.ip).toEqual('String')
    expect(result.so).toEqual('String')
    expect(result.ram).toEqual(8949152)
    expect(result.almacenamiento).toEqual({ foo: 'bar' })
    expect(result.cpu).toEqual(7071063)
    expect(result.estado).toEqual('ACTIVO')
    expect(result.usuario_creacion).toEqual(6308827)
  })

  scenario('updates a maquina', async (scenario) => {
    const original = await maquina({ id: scenario.maquina.one.id })
    const result = await updateMaquina({
      id: original.id,
      input: { cod_tipo_maquina: 'String2' },
    })

    expect(result.cod_tipo_maquina).toEqual('String2')
  })

  scenario('deletes a maquina', async (scenario) => {
    const original = await deleteMaquina({
      id: scenario.maquina.one.id,
    })
    const result = await maquina({ id: original.id })

    expect(result).toEqual(null)
  })
})
