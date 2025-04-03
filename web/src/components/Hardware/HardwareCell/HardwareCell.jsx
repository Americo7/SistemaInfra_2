import Hardware from 'src/components/Hardware/Hardware'

export const QUERY = gql`
  query FindHardwareById($id: Int!) {
    hardware: hardware(id: $id) {
      id
      id_data_center
      serie
      cod_activo_agetic
      cod_tipo_hw
      marca
      modelo
      estado_operativo
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Hardware not found</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ hardware }) => {
  return <Hardware hardware={hardware} />
}
