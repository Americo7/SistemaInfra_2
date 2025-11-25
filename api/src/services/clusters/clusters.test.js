import {
  clusters,
  cluster,
  createCluster,
  updateCluster,
  deleteCluster,
} from './clusters'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('clusters', () => {
  scenario('returns all clusters', async (scenario) => {
    const result = await clusters()

    expect(result.length).toEqual(Object.keys(scenario.cluster).length)
  })

  scenario('returns a single cluster', async (scenario) => {
    const result = await cluster({ id: scenario.cluster.one.id })

    expect(result).toEqual(scenario.cluster.one)
  })

  scenario('creates a cluster', async () => {
    const result = await createCluster({
      input: {
        nombre: 'String',
        cod_tipo_cluster: 'String',
        descripcion: 'String',
        estado: 'ACTIVO',
        usuario_creacion: 4915091,
      },
    })

    expect(result.nombre).toEqual('String')
    expect(result.cod_tipo_cluster).toEqual('String')
    expect(result.descripcion).toEqual('String')
    expect(result.estado).toEqual('ACTIVO')
    expect(result.usuario_creacion).toEqual(4915091)
  })

  scenario('updates a cluster', async (scenario) => {
    const original = await cluster({ id: scenario.cluster.one.id })
    const result = await updateCluster({
      id: original.id,
      input: { nombre: 'String2' },
    })

    expect(result.nombre).toEqual('String2')
  })

  scenario('deletes a cluster', async (scenario) => {
    const original = await deleteCluster({
      id: scenario.cluster.one.id,
    })
    const result = await cluster({ id: original.id })

    expect(result).toEqual(null)
  })
})
