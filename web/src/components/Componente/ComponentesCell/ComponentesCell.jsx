import { Link, routes } from '@redwoodjs/router'
import { gql } from '@redwoodjs/web'

import Componentes from 'src/components/Componente/Componentes'

export const QUERY = gql`
  query ListComponentes {
    componentes {
      id
      id_sistema
      nombre
      dominio
      descripcion
      cod_entorno
      cod_categoria
      gitlab_repo
      gitlab_rama
      tecnologia
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
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
      entornoInfo {
        id
        codigo
        nombre
      }
      categoriaInfo {
        id
        codigo
        nombre
      }
    }
    parametrosFormularioComponente {
      id
      codigo
      nombre
      grupo
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return (
    <div className="rw-text-center">
      {'No componentes yet. '}
      <Link to={routes.newComponente()} className="rw-link">
        {'Create one?'}
      </Link>
    </div>
  )
}

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ componentes, parametrosFormularioComponente }) => {
  return <Componentes componentes={componentes} parametros={parametrosFormularioComponente} />
}
