import { useState } from 'react'

import Select from 'react-select'

import { Form, FormError, Label, Submit, SelectField } from '@redwoodjs/forms'
import { useQuery } from '@redwoodjs/web'
const GET_EVENTOS = gql`
  query GetEventoInfra {
    eventos {
      id
      descripcion
      estado
    }
  }
`
const GET_DATA_CENTERS = gql`
  query GetDataCentersInfra {
    dataCenters {
      id
      nombre
      estado
    }
  }
`
const GET_HARDWARE = gql`
  query GetHardwareInfra {
    hardwares {
      id
      serie
      marca
      modelo
      estado
    }
  }
`
const GET_SERVIDORES = gql`
  query GetServidoresInfra {
    servidors {
      id
      serie_servidor
    }
  }
`
const GET_MAQUINAS = gql`
  query GetMaquinasInfra {
    maquinas {
      id
      nombre
    }
  }
`
const InfraAfectadaForm = (props) => {
  const { data: eventosData } = useQuery(GET_EVENTOS)
  const { data: dataCentersData } = useQuery(GET_DATA_CENTERS)
  const { data: hardwarsData } = useQuery(GET_HARDWARE)
  const { data: servidoresData } = useQuery(GET_SERVIDORES)
  const { data: maquinasData } = useQuery(GET_MAQUINAS)
  const [selectedEvento, setSelectedEvento] = useState(
    props.infraAfectada?.id_evento || null
  )
  const [selectedHardware, setSelectedHardware] = useState(
    props.infraAfectada?.id_hardware || null
  )
  const [selectedServidor, setSelectedServidor] = useState(
    props.infraAfectada?.id_servidor || null
  )
  const [selectedMaquina, setSelectedMaquina] = useState(
    props.infraAfectada?.id_maquina || null
  )
  const eventosOptions =
    eventosData?.eventos
      ?.filter((evento) => evento.estado === 'ACTIVO')
      .map((evento) => ({
        value: evento.id,
        label: evento.descripcion,
      })) || []
  const hardwareOptions =
    hardwarsData?.hardwares
      ?.filter((hardware) => hardware.estado === 'ACTIVO')
      .map((hardware) => ({
        value: hardware.id,
        label:
          hardware.serie + ' - ' + hardware.marca + ' - ' + hardware.modelo,
      })) || []
  const servidoresOptions =
    servidoresData?.servidors
      ?.filter((servidor) => servidor.estado === 'ACTIVO')
      .map((servidor) => ({
        value: servidor.id,
        label: servidor.serie_servidor,
      })) || []
  const maquinasOptions =
    maquinasData?.maquinas
      ?.filter((maquina) => maquina.estado === 'ACTIVO')
      .map((maquina) => ({
        value: maquina.id,
        label: maquina.nombre,
      })) || []
  const onSubmit = (data) => {
    const formData = {
      ...data,
      id_evento: selectedEvento,
      id_data_center: parseInt(data.id_data_center, 10),
      id_hardware: selectedHardware,
      id_servidor: selectedServidor,
      id_maquina: selectedMaquina,
      estado: 'ACTIVO',
      usuario_modificacion: 2,
      usuario_creacion: 3,
    }
    props.onSave(formData, props?.infraAfectada?.id)
  }

  return (
    <div className="rw-form-wrapper">
      <Form onSubmit={onSubmit} error={props.error}>
        <FormError
          error={props.error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />

        <Label className="input-label">Evento</Label>
        <Select
          name="id_evento"
          value={
            eventosOptions.find((option) => option.value === selectedEvento) ||
            ''
          }
          options={eventosOptions}
          onChange={(selectedOption) =>
            setSelectedEvento(selectedOption?.value || null)
          }
          className="input-field select-field"
          isClearable
          placeholder="Buscar y seleccionar un evento..."
        />

        <Label className="input-label">Data Center</Label>
        <SelectField
          name="id_data_center"
          defaultValue={props.infraAfectada?.id_data_center || ''}
          className="input-field select-field"
        >
          <option value="">Seleccionar data center...</option>
          {dataCentersData?.dataCenters
            ?.filter((dataCenter) => dataCenter.estado === 'ACTIVO')
            .map((dataCenter) => (
              <option key={dataCenter.id} value={dataCenter.id}>
                {dataCenter.nombre}
              </option>
            ))}
        </SelectField>

        <Label className="input-label">Hardware</Label>
        <Select
          name="id_hardware"
          value={
            hardwareOptions.find(
              (option) => option.value === selectedHardware
            ) || ''
          }
          options={hardwareOptions}
          onChange={(selectedOption) =>
            setSelectedHardware(selectedOption?.value || null)
          }
          className="input-field select-field"
          isClearable
          placeholder="Buscar y seleccionar un hardware..."
        />

        <Label className="input-label">Servidor</Label>
        <Select
          name="id_servidor"
          value={
            servidoresOptions.find(
              (option) => option.value === selectedServidor
            ) || ''
          }
          options={servidoresOptions}
          onChange={(selectedOption) =>
            setSelectedServidor(selectedOption?.value || null)
          }
          className="input-field select-field"
          isClearable
          placeholder="Buscar y seleccionar un servidor..."
        />

        <Label className="input-label">Maquina</Label>
        <Select
          name="id_maquina"
          value={
            maquinasOptions.find(
              (option) => option.value === selectedMaquina
            ) || ''
          }
          options={maquinasOptions}
          onChange={(selectedOption) =>
            setSelectedMaquina(selectedOption?.value || null)
          }
          className="input-field select-field"
          isClearable
          placeholder="Buscar y seleccionar una maquina..."
        />

        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Save
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default InfraAfectadaForm
