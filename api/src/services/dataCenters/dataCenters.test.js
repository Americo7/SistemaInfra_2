import {
  dataCenters,
  dataCenter,
  createDataCenter,
  updateDataCenter,
  deleteDataCenter,
} from './dataCenters'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('dataCenters', () => {
  scenario('returns all dataCenters', async (scenario) => {
    const result = await dataCenters()

    expect(result.length).toEqual(Object.keys(scenario.dataCenter).length)
  })

  scenario('returns a single dataCenter', async (scenario) => {
    const result = await dataCenter({ id: scenario.dataCenter.one.id })

    expect(result).toEqual(scenario.dataCenter.one)
  })

  scenario('creates a dataCenter', async () => {
    const result = await createDataCenter({
      input: {
        nombre: 'String',
        ubicacion: 'String',
        usuario_creacion: 1463225,
      },
    })

    expect(result.nombre).toEqual('String')
    expect(result.ubicacion).toEqual('String')
    expect(result.usuario_creacion).toEqual(1463225)
  })

  scenario('updates a dataCenter', async (scenario) => {
    const original = await dataCenter({
      id: scenario.dataCenter.one.id,
    })
    const result = await updateDataCenter({
      id: original.id,
      input: { nombre: 'String2' },
    })

    expect(result.nombre).toEqual('String2')
  })

  scenario('deletes a dataCenter', async (scenario) => {
    const original = await deleteDataCenter({
      id: scenario.dataCenter.one.id,
    })
    const result = await dataCenter({ id: original.id })

    expect(result).toEqual(null)
  })
})
