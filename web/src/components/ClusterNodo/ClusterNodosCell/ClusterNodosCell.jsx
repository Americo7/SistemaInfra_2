import { Link, routes } from '@redwoodjs/router'
import { gql } from '@redwoodjs/web'
import ClusterNodos from 'src/components/ClusterNodo/ClusterNodos'

export const QUERY = gql`
  query FindClusterNodos {
    clusterNodos {
      id
      clusterId
      nombre
      nodoTipo
      maquinaId
      servidorId
      rol
      estado
      identity_key
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
      cluster {
        id
        nombre
      }
      servidor {
        id
        nombre
      }
      maquina {
        id
        nombre
      }
      # Información de usuario para mostrar nombres en lugar de IDs
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
      # Información del Rol para mostrar nombre (Label) en vez del código
      rolInfo {
        id
        codigo
        nombre
      }
    }
  }
`

export const Loading = () => <div>Cargando nodos del cluster...</div>

export const isEmpty = () => false

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ clusterNodos }) => {
  // Ya no pasamos 'parametros' aquí
  return <ClusterNodos clusterNodos={clusterNodos} />
}