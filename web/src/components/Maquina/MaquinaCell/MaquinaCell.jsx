import Maquina from 'src/components/Maquina/Maquina'

export const QUERY = gql`
  query FindMaquinaById($id: Int!) {
    maquina: maquina(id: $id) {
      id
      codigo
      es_virtual
      cod_plataforma
      nombre
      ip
      so
      ram
      almacenamiento
      cpu
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Maquina not found</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ maquina }) => {
  return <Maquina maquina={maquina} />
}
