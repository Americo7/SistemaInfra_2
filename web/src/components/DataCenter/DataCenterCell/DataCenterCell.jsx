import DataCenter from 'src/components/DataCenter/DataCenter'

export const QUERY = gql`
  query FindDataCenterById($id: Int!) {
    dataCenter: dataCenter(id: $id) {
      id
      nombre
      ubicacion
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>DataCenter not found</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ dataCenter }) => {
  return <DataCenter dataCenter={dataCenter} />
}
