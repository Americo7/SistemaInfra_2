import {
  despliegueBitacoras,
  despliegueBitacora,
  createDespliegueBitacora,
  updateDespliegueBitacora,
  deleteDespliegueBitacora,
} from './despliegueBitacoras'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('despliegueBitacoras', () => {
  scenario('returns all despliegueBitacoras', async (scenario) => {
    const result = await despliegueBitacoras()

    expect(result.length).toEqual(
      Object.keys(scenario.despliegueBitacora).length
    )
  })

  scenario('returns a single despliegueBitacora', async (scenario) => {
    const result = await despliegueBitacora({
      id: scenario.despliegueBitacora.one.id,
    })

    expect(result).toEqual(scenario.despliegueBitacora.one)
  })

  scenario('creates a despliegueBitacora', async (scenario) => {
    const result = await createDespliegueBitacora({
      input: {
        id_despliegue: scenario.despliegueBitacora.two.id_despliegue,
        estado_anterior: 'String',
        estado_actual: 'String',
        usuario_creacion: 5897430,
      },
    })

    expect(result.id_despliegue).toEqual(
      scenario.despliegueBitacora.two.id_despliegue
    )
    expect(result.estado_anterior).toEqual('String')
    expect(result.estado_actual).toEqual('String')
    expect(result.usuario_creacion).toEqual(5897430)
  })

  scenario('updates a despliegueBitacora', async (scenario) => {
    const original = await despliegueBitacora({
      id: scenario.despliegueBitacora.one.id,
    })
    const result = await updateDespliegueBitacora({
      id: original.id,
      input: { estado_anterior: 'String2' },
    })

    expect(result.estado_anterior).toEqual('String2')
  })

  scenario('deletes a despliegueBitacora', async (scenario) => {
    const original = await deleteDespliegueBitacora({
      id: scenario.despliegueBitacora.one.id,
    })
    const result = await despliegueBitacora({ id: original.id })

    expect(result).toEqual(null)
  })
})
