import {
  eventos,
  evento,
  createEvento,
  updateEvento,
  deleteEvento,
} from './eventos'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('eventos', () => {
  scenario('returns all eventos', async (scenario) => {
    const result = await eventos()

    expect(result.length).toEqual(Object.keys(scenario.evento).length)
  })

  scenario('returns a single evento', async (scenario) => {
    const result = await evento({ id: scenario.evento.one.id })

    expect(result).toEqual(scenario.evento.one)
  })

  scenario('creates a evento', async () => {
    const result = await createEvento({
      input: {
        cod_tipo_evento: 'String',
        descripcion: 'String',
        fecha_evento: '2025-04-04T12:54:38.986Z',
        responsables: 8161473,
        estado_evento: 'String',
        estado: 'ACTIVO',
        usuario_creacion: 7047514,
      },
    })

    expect(result.cod_tipo_evento).toEqual('String')
    expect(result.descripcion).toEqual('String')
    expect(result.fecha_evento).toEqual(new Date('2025-04-04T12:54:38.986Z'))
    expect(result.responsables).toEqual(8161473)
    expect(result.estado_evento).toEqual('String')
    expect(result.estado).toEqual('ACTIVO')
    expect(result.usuario_creacion).toEqual(7047514)
  })

  scenario('updates a evento', async (scenario) => {
    const original = await evento({ id: scenario.evento.one.id })
    const result = await updateEvento({
      id: original.id,
      input: { cod_tipo_evento: 'String2' },
    })

    expect(result.cod_tipo_evento).toEqual('String2')
  })

  scenario('deletes a evento', async (scenario) => {
    const original = await deleteEvento({
      id: scenario.evento.one.id,
    })
    const result = await evento({ id: original.id })

    expect(result).toEqual(null)
  })
})
