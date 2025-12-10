import { Link, routes } from '@redwoodjs/router'
import { gql } from '@redwoodjs/web'
// Usamos ruta absoluta para importar el componente correctamente
import UsuarioRols from 'src/components/UsuarioRol/UsuarioRols/UsuarioRols'

export const QUERY = gql`
  query FindUsuarioRols {
    usuarioRols {
      id
      id_usuario
      id_rol
      id_maquina
      id_sistema
      estado
      usuarios {
        id
        nombres
        primer_apellido
      }
      roles {
        id
        nombre
      }
      maquinas {
        id
        nombre
      }
      sistemas {
        id
        nombre
      }
      creadoPor {
        id
        nombres
        primer_apellido
        segundo_apellido
      }
      modificadoPor {
        id
        nombres
        primer_apellido
        segundo_apellido
      }
    }
  }
`

export const Loading = () => <div>Cargando asignaciones...</div>

export const isEmpty = () => false

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ usuarioRols }) => {
  return <UsuarioRols usuarioRols={usuarioRols} />
}