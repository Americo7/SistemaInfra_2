import { Link, routes } from '@redwoodjs/router'

import UsuarioRols from 'src/components/UsuarioRol/UsuarioRols'

export const QUERY = gql`
  query FindUsuarioRols {
    usuarioRols {
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
      # Usando los nombres que sugiere el error
      usuarios {
        id
        nombres
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
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return (
    <div className="rw-text-center">
      {'No usuarioRols yet. '}
      <Link to={routes.newUsuarioRol()} className="rw-link">
        {'Create one?'}
      </Link>
    </div>
  )
}

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ usuarioRols }) => {
  return <UsuarioRols usuarioRols={usuarioRols} />
}
