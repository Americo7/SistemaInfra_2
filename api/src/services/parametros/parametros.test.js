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
        codigo: 'String5458936',
        nombre: 'String',
        grupo: 'String',
        usuario_creacion: 4916866,
      },
    })

    expect(result.codigo).toEqual('String5458936')
    expect(result.nombre).toEqual('String')
    expect(result.grupo).toEqual('String')
    expect(result.usuario_creacion).toEqual(4916866)
  })

  scenario('updates a parametro', async (scenario) => {
    const original = await parametro({
      id: scenario.parametro.one.id,
    })
    const result = await updateParametro({
      id: original.id,
      input: { codigo: 'String63470942' },
    })

    expect(result.codigo).toEqual('String63470942')
  })

  scenario('deletes a parametro', async (scenario) => {
    const original = await deleteParametro({
      id: scenario.parametro.one.id,
    })
    const result = await parametro({ id: original.id })

    expect(result).toEqual(null)
  })
})
