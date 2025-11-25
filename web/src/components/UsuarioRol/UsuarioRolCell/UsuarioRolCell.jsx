import UsuarioRol from 'src/components/UsuarioRol/UsuarioRol'

export const QUERY = gql`
  query FindUsuarioRolById($id: Int!) {
    usuarioRol: usuarioRol(id: $id) {
      id
      id_usuario
      id_rol
      id_maquina
      id_sistema
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>UsuarioRol not found</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ usuarioRol }) => {
  return <UsuarioRol usuarioRol={usuarioRol} />
}
