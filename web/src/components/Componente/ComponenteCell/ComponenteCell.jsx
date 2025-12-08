import Componente from 'src/components/Componente/Componente'
import { gql } from '@redwoodjs/web'

export const QUERY = gql`
  query FindComponenteById($id: Int!) {
    componente: componente(id: $id) {
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
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Componente not found</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ componente }) => {
  return <Componente componente={componente} />
}
