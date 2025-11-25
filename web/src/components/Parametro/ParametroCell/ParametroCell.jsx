import Parametro from 'src/components/Parametro/Parametro'

export const QUERY = gql`
  query FindParametroById($id: Int!) {
    parametro: parametro(id: $id) {
      id
      codigo
      nombre
      grupo
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
      descripcion
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Parametro not found</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ parametro }) => {
  return <Parametro parametro={parametro} />
}
