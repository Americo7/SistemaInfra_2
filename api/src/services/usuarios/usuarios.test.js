import {
  usuarios,
  usuario,
  createUsuario,
  updateUsuario,
  deleteUsuario,
} from './usuarios'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('usuarios', () => {
  scenario('returns all usuarios', async (scenario) => {
    const result = await usuarios()

    expect(result.length).toEqual(Object.keys(scenario.usuario).length)
  })

  scenario('returns a single usuario', async (scenario) => {
    const result = await usuario({ id: scenario.usuario.one.id })

    expect(result).toEqual(scenario.usuario.one)
  })

  scenario('creates a usuario', async () => {
    const result = await createUsuario({
      input: {
        nombre_usuario: 'String',
        nro_documento: 'String',
        nombres: 'String',
        primer_apellido: 'String',
        segundo_apellido: 'String',
        celular: 'String',
        email: 'String',
        estado: 'ACTIVO',
        usuario_creacion: 7469772,
      },
    })

    expect(result.nombre_usuario).toEqual('String')
    expect(result.nro_documento).toEqual('String')
    expect(result.nombres).toEqual('String')
    expect(result.primer_apellido).toEqual('String')
    expect(result.segundo_apellido).toEqual('String')
    expect(result.celular).toEqual('String')
    expect(result.email).toEqual('String')
    expect(result.estado).toEqual('ACTIVO')
    expect(result.usuario_creacion).toEqual(7469772)
  })

  scenario('updates a usuario', async (scenario) => {
    const original = await usuario({ id: scenario.usuario.one.id })
    const result = await updateUsuario({
      id: original.id,
      input: { nombre_usuario: 'String2' },
    })

    expect(result.nombre_usuario).toEqual('String2')
  })

  scenario('deletes a usuario', async (scenario) => {
    const original = await deleteUsuario({
      id: scenario.usuario.one.id,
    })
    const result = await usuario({ id: original.id })

    expect(result).toEqual(null)
  })
})
