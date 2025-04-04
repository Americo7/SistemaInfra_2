import { rols, rol, createRol, updateRol, deleteRol } from './rols'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('rols', () => {
  scenario('returns all rols', async (scenario) => {
    const result = await rols()

    expect(result.length).toEqual(Object.keys(scenario.rol).length)
  })

  scenario('returns a single rol', async (scenario) => {
    const result = await rol({ id: scenario.rol.one.id })

    expect(result).toEqual(scenario.rol.one)
  })

  scenario('creates a rol', async () => {
    const result = await createRol({
      input: { name: 'String4922936' },
    })

    expect(result.name).toEqual('String4922936')
  })

  scenario('updates a rol', async (scenario) => {
    const original = await rol({ id: scenario.rol.one.id })
    const result = await updateRol({
      id: original.id,
      input: { name: 'String49685872' },
    })

    expect(result.name).toEqual('String49685872')
  })

  scenario('deletes a rol', async (scenario) => {
    const original = await deleteRol({ id: scenario.rol.one.id })
    const result = await rol({ id: original.id })

    expect(result).toEqual(null)
  })
})
