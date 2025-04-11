import { useState, useEffect } from 'react'
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

const GET_SERVIDORES = gql`
  query GetServidoresInfra {
    servidores {
      id
      serie
      modelo
      marca
      cod_tipo_servidor
      estado
    }
  }
`

const GET_MAQUINAS = gql`
  query GetMaquinasInfra {
    maquinas {
      id
      nombre
      estado
    }
  }
`

const customStyles = {
  control: (provided) => ({
    ...provided,
    minHeight: '42px',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#9ca3af',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#3b82f6' : 'white',
    color: state.isSelected ? 'white' : '#1f2937',
    '&:hover': {
      backgroundColor: '#e5e7eb',
    },
  }),
}

const InfraAfectadaForm = (props) => {
  const { data: eventosData, loading: loadingEventos } = useQuery(GET_EVENTOS)
  const { data: dataCentersData, loading: loadingDataCenters } = useQuery(GET_DATA_CENTERS)
  const { data: servidoresData, loading: loadingServidores } = useQuery(GET_SERVIDORES)
  const { data: maquinasData, loading: loadingMaquinas } = useQuery(GET_MAQUINAS)

  const [selectedEvento, setSelectedEvento] = useState(null)
  const [selectedServidor, setSelectedServidor] = useState(null)
  const [selectedMaquina, setSelectedMaquina] = useState(null)
  const [selectedDataCenter, setSelectedDataCenter] = useState('')

  // Efecto para inicializar los valores cuando hay datos para editar
  useEffect(() => {
    if (props.infraAfectada) {
      setSelectedEvento(props.infraAfectada.id_evento)
      setSelectedServidor(props.infraAfectada.id_servidor)
      setSelectedMaquina(props.infraAfectada.id_maquina)
      setSelectedDataCenter(props.infraAfectada.id_data_center?.toString() || '')
    }
  }, [props.infraAfectada, dataCentersData, servidoresData, maquinasData, eventosData])

  const eventosOptions =
    eventosData?.eventos
      ?.filter((evento) => evento.estado === 'ACTIVO')
      .map((evento) => ({
        value: evento.id,
        label: evento.descripcion,
      })) || []

  const servidoresOptions =
    servidoresData?.servidores
      ?.filter((servidor) => servidor.estado === 'ACTIVO')
      .map((servidor) => ({
        value: servidor.id,
        label: `${servidor.serie} - ${servidor.marca} ${servidor.modelo} (${servidor.cod_tipo_servidor})`,
      })) || []

  const maquinasOptions =
    maquinasData?.maquinas
      ?.filter((maquina) => maquina.estado === 'ACTIVO')
      .map((maquina) => ({
        value: maquina.id,
        label: maquina.nombre,
      })) || []

  const dataCenterOptions =
    dataCentersData?.dataCenters
      ?.filter((dataCenter) => dataCenter.estado === 'ACTIVO')
      .map((dataCenter) => ({
        value: dataCenter.id.toString(),
        label: dataCenter.nombre,
      })) || []

  const onSubmit = (data) => {
    const formData = {
      ...data,
      id_evento: selectedEvento,
      id_data_center: parseInt(selectedDataCenter, 10),
      id_servidor: selectedServidor,
      id_maquina: selectedMaquina,
      estado: 'ACTIVO',
      usuario_modificacion: 2,
      usuario_creacion: 3,
    }
    props.onSave(formData, props?.infraAfectada?.id)
  }

  if (loadingEventos || loadingDataCenters || loadingServidores || loadingMaquinas) {
    return <div>Cargando datos...</div>
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

        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-1">Evento</Label>
          <Select
            name="id_evento"
            value={eventosOptions.find((option) => option.value === selectedEvento) || null}
            options={eventosOptions}
            onChange={(selectedOption) => setSelectedEvento(selectedOption?.value || null)}
            styles={customStyles}
            className="basic-single"
            classNamePrefix="select"
            isClearable
            placeholder="Buscar y seleccionar un evento..."
            noOptionsMessage={() => "No hay opciones disponibles"}
          />
        </div>

        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-1">Data Center</Label>
          <Select
            name="id_data_center"
            value={dataCenterOptions.find((option) => option.value === selectedDataCenter) || null}
            options={dataCenterOptions}
            onChange={(selectedOption) => setSelectedDataCenter(selectedOption?.value || '')}
            styles={customStyles}
            className="basic-single"
            classNamePrefix="select"
            isClearable
            placeholder="Seleccionar data center..."
            noOptionsMessage={() => "No hay data centers disponibles"}
          />
        </div>

        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-1">Servidor</Label>
          <Select
            name="id_servidor"
            value={servidoresOptions.find((option) => option.value === selectedServidor) || null}
            options={servidoresOptions}
            onChange={(selectedOption) => setSelectedServidor(selectedOption?.value || null)}
            styles={customStyles}
            className="basic-single"
            classNamePrefix="select"
            isClearable
            placeholder="Buscar y seleccionar un servidor..."
            noOptionsMessage={() => "No hay servidores disponibles"}
          />
        </div>

        <div className="mb-4">
          <Label className="block text-sm font-medium text-gray-700 mb-1">Máquina</Label>
          <Select
            name="id_maquina"
            value={maquinasOptions.find((option) => option.value === selectedMaquina) || null}
            options={maquinasOptions}
            onChange={(selectedOption) => setSelectedMaquina(selectedOption?.value || null)}
            styles={customStyles}
            className="basic-single"
            classNamePrefix="select"
            isClearable
            placeholder="Buscar y seleccionar una máquina..."
            noOptionsMessage={() => "No hay máquinas disponibles"}
          />
        </div>

        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Guardar
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default InfraAfectadaForm
