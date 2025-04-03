import Role from 'src/components/Role/Role'

export const QUERY = gql`
  query FindRoleById($id: Int!) {
    role: role(id: $id) {
      id
      nombre
      cod_tipo_rol
      descripcion
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Role not found</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ role }) => {
  return <Role role={role} />
}
