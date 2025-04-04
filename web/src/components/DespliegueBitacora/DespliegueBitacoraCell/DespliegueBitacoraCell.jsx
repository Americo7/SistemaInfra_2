import DespliegueBitacora from 'src/components/DespliegueBitacora/DespliegueBitacora'

export const QUERY = gql`
  query FindDespliegueBitacoraById($id: Int!) {
    despliegueBitacora: despliegueBitacora(id: $id) {
      id
      id_despliegue
      estado_anterior
      estado_actual
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>DespliegueBitacora not found</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ despliegueBitacora }) => {
  return <DespliegueBitacora despliegueBitacora={despliegueBitacora} />
}
