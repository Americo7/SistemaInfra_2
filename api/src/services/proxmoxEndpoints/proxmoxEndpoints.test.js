import {
  proxmoxEndpoints,
  proxmoxEndpoint,
  createProxmoxEndpoint,
  updateProxmoxEndpoint,
  deleteProxmoxEndpoint,
} from './proxmoxEndpoints'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('proxmoxEndpoints', () => {
  scenario('returns all proxmoxEndpoints', async (scenario) => {
    const result = await proxmoxEndpoints()

    expect(result.length).toEqual(Object.keys(scenario.proxmoxEndpoint).length)
  })

  scenario('returns a single proxmoxEndpoint', async (scenario) => {
    const result = await proxmoxEndpoint({
      id: scenario.proxmoxEndpoint.one.id,
    })

    expect(result).toEqual(scenario.proxmoxEndpoint.one)
  })

  scenario('creates a proxmoxEndpoint', async () => {
    const result = await createProxmoxEndpoint({
      input: {
        nombre: 'String',
        puerto: 7058427,
        ssl: true,
        usuario: 'String',
        token_id: 'String',
        token_secret: 'String',
        estado: 'ACTIVO',
        usuario_creacion: 8158620,
      },
    })

    expect(result.nombre).toEqual('String')
    expect(result.puerto).toEqual(7058427)
    expect(result.ssl).toEqual(true)
    expect(result.usuario).toEqual('String')
    expect(result.token_id).toEqual('String')
    expect(result.token_secret).toEqual('String')
    expect(result.estado).toEqual('ACTIVO')
    expect(result.usuario_creacion).toEqual(8158620)
  })

  scenario('updates a proxmoxEndpoint', async (scenario) => {
    const original = await proxmoxEndpoint({
      id: scenario.proxmoxEndpoint.one.id,
    })
    const result = await updateProxmoxEndpoint({
      id: original.id,
      input: { nombre: 'String2' },
    })

    expect(result.nombre).toEqual('String2')
  })

  scenario('deletes a proxmoxEndpoint', async (scenario) => {
    const original = await deleteProxmoxEndpoint({
      id: scenario.proxmoxEndpoint.one.id,
    })
    const result = await proxmoxEndpoint({ id: original.id })

    expect(result).toEqual(null)
  })
})
