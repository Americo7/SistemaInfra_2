import { Link, routes } from '@redwoodjs/router'

import Roles from 'src/components/Role/Roles'

export const QUERY = gql`
  query FindRoles {
    roles {
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

export const Empty = () => {
  return (
    <div className="rw-text-center">
      {'No roles yet. '}
      <Link to={routes.newRole()} className="rw-link">
        {'Create one?'}
      </Link>
    </div>
  )
}

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ roles }) => {
  return <Roles roles={roles} />
}
