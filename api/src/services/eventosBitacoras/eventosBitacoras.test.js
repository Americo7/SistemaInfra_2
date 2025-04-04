import {
  eventosBitacoras,
  eventosBitacora,
  createEventosBitacora,
  updateEventosBitacora,
  deleteEventosBitacora,
} from './eventosBitacoras'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('eventosBitacoras', () => {
  scenario('returns all eventosBitacoras', async (scenario) => {
    const result = await eventosBitacoras()

    expect(result.length).toEqual(Object.keys(scenario.eventosBitacora).length)
  })

  scenario('returns a single eventosBitacora', async (scenario) => {
    const result = await eventosBitacora({
      id: scenario.eventosBitacora.one.id,
    })

    expect(result).toEqual(scenario.eventosBitacora.one)
  })

  scenario('creates a eventosBitacora', async (scenario) => {
    const result = await createEventosBitacora({
      input: {
        id_evento: scenario.eventosBitacora.two.id_evento,
        usuario_creacion: 8116092,
        estado_anterior: 'String',
        estado_actual: 'String',
      },
    })

    expect(result.id_evento).toEqual(scenario.eventosBitacora.two.id_evento)
    expect(result.usuario_creacion).toEqual(8116092)
    expect(result.estado_anterior).toEqual('String')
    expect(result.estado_actual).toEqual('String')
  })

  scenario('updates a eventosBitacora', async (scenario) => {
    const original = await eventosBitacora({
      id: scenario.eventosBitacora.one.id,
    })
    const result = await updateEventosBitacora({
      id: original.id,
      input: { usuario_creacion: 1671679 },
    })

    expect(result.usuario_creacion).toEqual(1671679)
  })

  scenario('deletes a eventosBitacora', async (scenario) => {
    const original = await deleteEventosBitacora({
      id: scenario.eventosBitacora.one.id,
    })
    const result = await eventosBitacora({ id: original.id })

    expect(result).toEqual(null)
  })
})
