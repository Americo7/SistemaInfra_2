import { Link, routes } from '@redwoodjs/router'
import { gql } from '@redwoodjs/web'
import Servidores from 'src/components/Servidor/Servidors'

export const QUERY = gql`
  query FindServidores {
    servidores {
      id
      nombre
      ip_primaria
      ram
      almacenamiento
      estado

      # Ubicación
      data_centers {
        id
        nombre
      }

      # Jerarquía
      servidores_padre {
        id
        nombre
      }

      # Información decodificada (parámetros)
      tipoServidorInfo {
        nombre
      }

      estadoOperativoInfo {
        nombre
        codigo
      }

      # Auditoría
      fecha_creacion
      creadoPor {
        id
        nombres
        primer_apellido
        segundo_apellido
      }

      fecha_modificacion
      modificadoPor {
        id
        nombres
        primer_apellido
        segundo_apellido
      }

      cluster_nodos {
        id
        nombre
        cluster {
          id
          nombre
        }
      }
    }
  }
`

export const Loading = () => <div>Cargando servidores...</div>

export const isEmpty = () => false

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ servidores }) => {
  return <Servidores servidores={servidores} />
}
