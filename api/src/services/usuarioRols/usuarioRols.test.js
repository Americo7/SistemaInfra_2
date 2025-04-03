import {
  usuarioRols,
  usuarioRol,
  createUsuarioRol,
  updateUsuarioRol,
  deleteUsuarioRol,
} from './usuarioRols'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('usuarioRols', () => {
  scenario('returns all usuarioRols', async (scenario) => {
    const result = await usuarioRols()

    expect(result.length).toEqual(Object.keys(scenario.usuarioRol).length)
  })

  scenario('returns a single usuarioRol', async (scenario) => {
    const result = await usuarioRol({ id: scenario.usuarioRol.one.id })

    expect(result).toEqual(scenario.usuarioRol.one)
  })

  scenario('creates a usuarioRol', async (scenario) => {
    const result = await createUsuarioRol({
      input: {
        id_usuario: scenario.usuarioRol.two.id_usuario,
        id_rol: scenario.usuarioRol.two.id_rol,
        estado: 'ACTIVO',
        usuario_creacion: 1647365,
      },
    })

    expect(result.id_usuario).toEqual(scenario.usuarioRol.two.id_usuario)
    expect(result.id_rol).toEqual(scenario.usuarioRol.two.id_rol)
    expect(result.estado).toEqual('ACTIVO')
    expect(result.usuario_creacion).toEqual(1647365)
  })

  scenario('updates a usuarioRol', async (scenario) => {
    const original = await usuarioRol({
      id: scenario.usuarioRol.one.id,
    })
    const result = await updateUsuarioRol({
      id: original.id,
      input: { estado: 'INACTIVO' },
    })

    expect(result.estado).toEqual('INACTIVO')
  })

  scenario('deletes a usuarioRol', async (scenario) => {
    const original = await deleteUsuarioRol({
      id: scenario.usuarioRol.one.id,
    })
    const result = await usuarioRol({ id: original.id })

    expect(result).toEqual(null)
  })
})
