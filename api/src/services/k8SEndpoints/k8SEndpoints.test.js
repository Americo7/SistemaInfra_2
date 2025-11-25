import {
  k8SEndpoints,
  k8SEndpoint,
  createK8sEndpoint,
  updateK8sEndpoint,
  deleteK8sEndpoint,
} from './k8SEndpoints'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('k8SEndpoints', () => {
  scenario('returns all k8SEndpoints', async (scenario) => {
    const result = await k8SEndpoints()

    expect(result.length).toEqual(Object.keys(scenario.k8SEndpoint).length)
  })

  scenario('returns a single k8SEndpoint', async (scenario) => {
    const result = await k8SEndpoint({ id: scenario.k8SEndpoint.one.id })

    expect(result).toEqual(scenario.k8SEndpoint.one)
  })

  scenario('creates a k8SEndpoint', async () => {
    const result = await createK8sEndpoint({
      input: {
        nombre: 'String',
        url_api: 'String',
        token_bearer: 'String',
        estado: 'ACTIVO',
        usuario_creacion: 5951574,
      },
    })

    expect(result.nombre).toEqual('String')
    expect(result.url_api).toEqual('String')
    expect(result.token_bearer).toEqual('String')
    expect(result.estado).toEqual('ACTIVO')
    expect(result.usuario_creacion).toEqual(5951574)
  })

  scenario('updates a k8SEndpoint', async (scenario) => {
    const original = await k8SEndpoint({
      id: scenario.k8SEndpoint.one.id,
    })
    const result = await updateK8sEndpoint({
      id: original.id,
      input: { nombre: 'String2' },
    })

    expect(result.nombre).toEqual('String2')
  })

  scenario('deletes a k8SEndpoint', async (scenario) => {
    const original = await deleteK8sEndpoint({
      id: scenario.k8SEndpoint.one.id,
    })
    const result = await k8SEndpoint({ id: original.id })

    expect(result).toEqual(null)
  })
})
