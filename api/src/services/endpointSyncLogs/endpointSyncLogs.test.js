import {
  endpointSyncLogs,
  endpointSyncLog,
  createEndpointSyncLog,
  updateEndpointSyncLog,
  deleteEndpointSyncLog,
} from './endpointSyncLogs'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('endpointSyncLogs', () => {
  scenario('returns all endpointSyncLogs', async (scenario) => {
    const result = await endpointSyncLogs()

    expect(result.length).toEqual(Object.keys(scenario.endpointSyncLog).length)
  })

  scenario('returns a single endpointSyncLog', async (scenario) => {
    const result = await endpointSyncLog({
      id: scenario.endpointSyncLog.one.id,
    })

    expect(result).toEqual(scenario.endpointSyncLog.one)
  })

  scenario('creates a endpointSyncLog', async () => {
    const result = await createEndpointSyncLog({
      input: {
        tipo_endpoint: 'PROXMOX',
        estado_sync: 'INICIADO',
        trigger: 'MANUAL',
        fecha_inicio: '2025-12-16T17:18:26.162Z',
        estado: 'ACTIVO',
        usuario_creacion: 1853226,
      },
    })

    expect(result.tipo_endpoint).toEqual('PROXMOX')
    expect(result.estado_sync).toEqual('INICIADO')
    expect(result.trigger).toEqual('MANUAL')
    expect(result.fecha_inicio).toEqual(new Date('2025-12-16T17:18:26.162Z'))
    expect(result.estado).toEqual('ACTIVO')
    expect(result.usuario_creacion).toEqual(1853226)
  })

  scenario('updates a endpointSyncLog', async (scenario) => {
    const original = await endpointSyncLog({
      id: scenario.endpointSyncLog.one.id,
    })
    const result = await updateEndpointSyncLog({
      id: original.id,
      input: { tipo_endpoint: 'K8S' },
    })

    expect(result.tipo_endpoint).toEqual('K8S')
  })

  scenario('deletes a endpointSyncLog', async (scenario) => {
    const original = await deleteEndpointSyncLog({
      id: scenario.endpointSyncLog.one.id,
    })
    const result = await endpointSyncLog({ id: original.id })

    expect(result).toEqual(null)
  })
})
