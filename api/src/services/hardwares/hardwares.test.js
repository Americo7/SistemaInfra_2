import {
  hardwares,
  hardware,
  createHardware,
  updateHardware,
  deleteHardware,
} from './hardwares'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('hardwares', () => {
  scenario('returns all hardwares', async (scenario) => {
    const result = await hardwares()

    expect(result.length).toEqual(Object.keys(scenario.hardware).length)
  })

  scenario('returns a single hardware', async (scenario) => {
    const result = await hardware({ id: scenario.hardware.one.id })

    expect(result).toEqual(scenario.hardware.one)
  })

  scenario('creates a hardware', async (scenario) => {
    const result = await createHardware({
      input: {
        id_data_center: scenario.hardware.two.id_data_center,
        serie: 'String',
        cod_activo_agetic: 'String',
        cod_tipo_hw: 'String',
        marca: 'String',
        modelo: 'String',
        estado_operativo: 'String',
        estado: 'ACTIVO',
        usuario_creacion: 7628267,
      },
    })

    expect(result.id_data_center).toEqual(scenario.hardware.two.id_data_center)
    expect(result.serie).toEqual('String')
    expect(result.cod_activo_agetic).toEqual('String')
    expect(result.cod_tipo_hw).toEqual('String')
    expect(result.marca).toEqual('String')
    expect(result.modelo).toEqual('String')
    expect(result.estado_operativo).toEqual('String')
    expect(result.estado).toEqual('ACTIVO')
    expect(result.usuario_creacion).toEqual(7628267)
  })

  scenario('updates a hardware', async (scenario) => {
    const original = await hardware({
      id: scenario.hardware.one.id,
    })
    const result = await updateHardware({
      id: original.id,
      input: { serie: 'String2' },
    })

    expect(result.serie).toEqual('String2')
  })

  scenario('deletes a hardware', async (scenario) => {
    const original = await deleteHardware({
      id: scenario.hardware.one.id,
    })
    const result = await hardware({ id: original.id })

    expect(result).toEqual(null)
  })
})
