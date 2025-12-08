import { Link, routes } from '@redwoodjs/router'
import { gql } from '@redwoodjs/web'
// Usamos ruta absoluta para evitar conflictos de importación
import Usuarios from 'src/components/Usuario/Usuarios/Usuarios'

export const QUERY = gql`
  query FindUsuarios {
    usuarios {
      id
      id_ciudadano_digital
      nombre_usuario
      nro_documento
      nombres
      primer_apellido
      segundo_apellido
      celular
      email
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

export const Loading = () => <div>Cargando usuarios...</div>

export const Empty = () => (
  <div className="rw-text-center">
    No existen usuarios registrados.{' '}
    <Link to={routes.newUsuario()} className="rw-link">
      Crear uno nuevo
    </Link>
  </div>
)

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ usuarios }) => {
  return <Usuarios usuarios={usuarios} />
}