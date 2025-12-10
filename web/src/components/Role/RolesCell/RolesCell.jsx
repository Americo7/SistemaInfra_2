import { Link, routes } from '@redwoodjs/router'
import { gql } from '@redwoodjs/web'
import Roles from 'src/components/Role/Roles/Roles'

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
      tipoRolInfo {
        id
        codigo
        nombre
      }
    }
  }
`

export const Loading = () => <div>Cargando roles...</div>

export const isEmpty = () => false
export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ roles, parametrosFormularioRole }) => {
  return <Roles roles={roles} parametros={parametrosFormularioRole} />
}