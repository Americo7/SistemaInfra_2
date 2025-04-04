import { roles, role, createRole, updateRole, deleteRole } from './roles'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('roles', () => {
  scenario('returns all roles', async (scenario) => {
    const result = await roles()

    expect(result.length).toEqual(Object.keys(scenario.role).length)
  })

  scenario('returns a single role', async (scenario) => {
    const result = await role({ id: scenario.role.one.id })

    expect(result).toEqual(scenario.role.one)
  })

  scenario('creates a role', async () => {
    const result = await createRole({
      input: {
        nombre: 'String',
        cod_tipo_rol: 'String',
        descripcion: 'String',
        estado: 'ACTIVO',
        usuario_creacion: 3959037,
      },
    })

    expect(result.nombre).toEqual('String')
    expect(result.cod_tipo_rol).toEqual('String')
    expect(result.descripcion).toEqual('String')
    expect(result.estado).toEqual('ACTIVO')
    expect(result.usuario_creacion).toEqual(3959037)
  })

  scenario('updates a role', async (scenario) => {
    const original = await role({ id: scenario.role.one.id })
    const result = await updateRole({
      id: original.id,
      input: { nombre: 'String2' },
    })

    expect(result.nombre).toEqual('String2')
  })

  scenario('deletes a role', async (scenario) => {
    const original = await deleteRole({ id: scenario.role.one.id })
    const result = await role({ id: original.id })

    expect(result).toEqual(null)
  })
})
