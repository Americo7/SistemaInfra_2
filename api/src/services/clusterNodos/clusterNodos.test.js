import {
  clusterNodos,
  clusterNodo,
  createClusterNodo,
  updateClusterNodo,
  deleteClusterNodo,
} from './clusterNodos'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('clusterNodos', () => {
  scenario('returns all clusterNodos', async (scenario) => {
    const result = await clusterNodos()

    expect(result.length).toEqual(Object.keys(scenario.clusterNodo).length)
  })

  scenario('returns a single clusterNodo', async (scenario) => {
    const result = await clusterNodo({ id: scenario.clusterNodo.one.id })

    expect(result).toEqual(scenario.clusterNodo.one)
  })

  scenario('creates a clusterNodo', async (scenario) => {
    const result = await createClusterNodo({
      input: {
        clusterId: scenario.clusterNodo.two.clusterId,
        nombre: 'String',
        nodoTipo: 'String',
        estado: 'ACTIVO',
        usuario_creacion: 48656,
      },
    })

    expect(result.clusterId).toEqual(scenario.clusterNodo.two.clusterId)
    expect(result.nombre).toEqual('String')
    expect(result.nodoTipo).toEqual('String')
    expect(result.estado).toEqual('ACTIVO')
    expect(result.usuario_creacion).toEqual(48656)
  })

  scenario('updates a clusterNodo', async (scenario) => {
    const original = await clusterNodo({
      id: scenario.clusterNodo.one.id,
    })
    const result = await updateClusterNodo({
      id: original.id,
      input: { nombre: 'String2' },
    })

    expect(result.nombre).toEqual('String2')
  })

  scenario('deletes a clusterNodo', async (scenario) => {
    const original = await deleteClusterNodo({
      id: scenario.clusterNodo.one.id,
    })
    const result = await clusterNodo({ id: original.id })

    expect(result).toEqual(null)
  })
})
