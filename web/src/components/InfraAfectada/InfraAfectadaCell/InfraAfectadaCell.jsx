import InfraAfectada from 'src/components/InfraAfectada/InfraAfectada'

export const QUERY = gql`
  query FindInfraAfectadaById($id: Int!) {
    infraAfectada: infraAfectada(id: $id) {
      id
      id_evento
      id_data_center
      id_hardware
      id_servidor
      id_maquina
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>InfraAfectada not found</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ infraAfectada }) => {
  return <InfraAfectada infraAfectada={infraAfectada} />
}
