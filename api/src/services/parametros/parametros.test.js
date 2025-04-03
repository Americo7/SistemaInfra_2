import {
  parametros,
  parametro,
  createParametro,
  updateParametro,
  deleteParametro,
} from './parametros'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('parametros', () => {
  scenario('returns all parametros', async (scenario) => {
    const result = await parametros()

    expect(result.length).toEqual(Object.keys(scenario.parametro).length)
  })

  scenario('returns a single parametro', async (scenario) => {
    const result = await parametro({ id: scenario.parametro.one.id })

    expect(result).toEqual(scenario.parametro.one)
  })

  scenario('creates a parametro', async () => {
    const result = await createParametro({
      input: {
        codigo: 'String',
        nombre: 'String',
        grupo: 'String',
        usuario_creacion: 7852345,
      },
    })

    expect(result.codigo).toEqual('String')
    expect(result.nombre).toEqual('String')
    expect(result.grupo).toEqual('String')
    expect(result.usuario_creacion).toEqual(7852345)
  })

  scenario('updates a parametro', async (scenario) => {
    const original = await parametro({
      id: scenario.parametro.one.id,
    })
    const result = await updateParametro({
      id: original.id,
      input: { codigo: 'String2' },
    })

    expect(result.codigo).toEqual('String2')
  })

  scenario('deletes a parametro', async (scenario) => {
    const original = await deleteParametro({
      id: scenario.parametro.one.id,
    })
    const result = await parametro({ id: original.id })

    expect(result).toEqual(null)
  })
})
