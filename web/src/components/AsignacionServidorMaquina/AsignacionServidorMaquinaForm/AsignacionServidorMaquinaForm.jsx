import { useState } from 'react'
import Select from 'react-select'
import { Form, FormError, Label, Submit } from '@redwoodjs/forms'
import { useQuery } from '@redwoodjs/web'

const OBTENER_SERVIDORES = gql`
  query ObtenerServidores {
    servidores {
      id
      serie
      modelo
      cod_tipo_servidor
      estado
    }
  }
`
const OBTENER_CLUSTERS = gql`
  query ObtenerClustersAsignacion {
    clusters {
      id
      nombre
      estado
    }
  }
`

const GET_MAQUINA = gql`
  query GetMaquinasAsignacion {
    maquinas {
      id
      nombre
      estado
    }
  }
`

const AsignacionServidorMaquinaForm = (props) => {
  const { data: servidoresData } = useQuery(OBTENER_SERVIDORES)
  const { data: clustersData } = useQuery(OBTENER_CLUSTERS)
  const { data: maquinasData } = useQuery(GET_MAQUINA)
  const [selectedCluster, setSelectedCluster] = useState(
    props.asignacionServidorMaquina?.id_cluster || null
  )
  const [selectedServidor, setSelectedServidor] = useState(
    props.asignacionServidorMaquina?.id_servidor || null
  )
  const [selectedMaquina, setSelectedMaquina] = useState(
    props.asignacionServidorMaquina?.id_maquina || null
  )

  const clustersOptions =
    clustersData?.clusters
      ?.filter((cluster) => cluster.estado === 'ACTIVO')
      .map((cluster) => ({
        value: cluster.id,
        label: cluster.nombre,
      })) || []

  const servidoresOptions =
    servidoresData?.servidores
      ?.filter((servidor) => servidor.estado === 'ACTIVO')
      .map((servidor) => ({
        value: servidor.id,
        label: `${servidor.modelo} - ${servidor.serie} (${servidor.cod_tipo_servidor})`,
        modelo: servidor.modelo,
        serie: servidor.serie,
        tipo: servidor.cod_tipo_servidor,
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
      id_servidor: selectedServidor,
      id_cluster: selectedCluster,
      id_maquina: selectedMaquina,
      estado: 'ACTIVO',
      usuario_modificacion: 2,
      usuario_creacion: 3,
    }
    props.onSave(formData, props?.asignacionServidorMaquina?.id)
  }

  const formatOptionLabel = ({ value, label, modelo, serie, tipo }) => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span>{label}</span>
      <div style={{ display: 'flex', fontSize: '0.8em', color: '#666', gap: '10px' }}>
        <span>Modelo: {modelo}</span>
        <span>Serie: {serie}</span>
        <span>Tipo: {tipo}</span>
      </div>
    </div>
  )

  return (
    <div className="rw-form-wrapper">
      <Form onSubmit={onSubmit} error={props.error}>
        <FormError
          error={props.error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
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
          formatOptionLabel={formatOptionLabel}
        />

        <Label className="input-label">Máquina</Label>
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
          placeholder="Buscar y seleccionar una máquina..."
        />

        <Label className="input-label">Cluster</Label>
        <Select
          name="id_cluster"
          value={
            clustersOptions.find(
              (option) => option.value === selectedCluster
            ) || ''
          }
          options={clustersOptions}
          onChange={(selectedOption) =>
            setSelectedCluster(selectedOption?.value || null)
          }
          className="input-field select-field"
          isClearable
          placeholder="Buscar y seleccionar un cluster..."
        />

        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Guardar
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default AsignacionServidorMaquinaForm
