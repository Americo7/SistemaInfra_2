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
        segundo_apellido
      }
      modificadoPor {
        id
        nombres
        primer_apellido
        segundo_apellido
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
      sistemas {
        id
        nombre
        sigla
      }   
      # Campo eliminado: parametros: parametrosFormularioComponente
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const isEmpty = () => false

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

// CORRECCIÓN APLICADA: Eliminamos 'parametros' de la desestructuración, 
// ya que no se carga en la QUERY.
export const Success = ({ componentes }) => {
  // Ahora Componentes recibe solo los datos de la lista
  return <Componentes componentes={componentes} /> 
}