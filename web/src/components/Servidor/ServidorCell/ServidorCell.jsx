import Servidor from 'src/components/Servidor/Servidor'

export const QUERY = gql`
  query FindServidorById($id: Int!) {
    servidor: servidor(id: $id) {
      id
      cod_inventario_agetic
      nombre
      ram
      almacenamiento
      estado_operativo
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
      id_data_center
      serie
      id_padre
      cod_tipo_servidor
      marca
      modelo
    }
  }
`

export const Loading = () => <div>Cargando servidor...</div>

export const Empty = () => <div>Servidor no encontrado</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ servidor }) => {
  return <Servidor servidor={servidor} />
}
