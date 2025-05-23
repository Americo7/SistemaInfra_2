import Usuario from 'src/components/Usuario/Usuario'

export const QUERY = gql`
  query FindUsuarioById($id: Int!) {
    usuario: usuario(id: $id) {
      id
      id_ciudadano_digital
      nombre_usuario
      contrasena
      nro_documento
      nombres
      primer_apellido
      segundo_apellido
      celular
      email
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Usuario not found</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ usuario }) => {
  return <Usuario usuario={usuario} />
}
