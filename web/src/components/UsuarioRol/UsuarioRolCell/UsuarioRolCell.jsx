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
      creadoPor {
        id
        nombres
        primer_apellido
      }
      modificadoPor {
        id
        nombres
        primer_apellido
      }
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
