import { Link, routes } from '@redwoodjs/router'
import { gql } from '@redwoodjs/web'
import Servidores from 'src/components/Servidor/Servidors'

export const QUERY = gql`
  query FindServidores {
    servidores {
      id
      nombre
      ip_primaria
      marca
      modelo
      ram
      almacenamiento
      estado
      identity_key
      
      # Información de ubicación y jerarquía
      data_centers {
        nombre
      }
      servidores_padre {
        nombre
      }

      # Información decodificada de parámetros
      tipoServidorInfo {
        nombre
      }
      estadoOperativoInfo {
        nombre
        codigo 
      }
      
      # Auditoría básica
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
    }
  } 
`

export const Loading = () => <div>Cargando servidores...</div>

export const Empty = () => (
  <div className="rw-text-center">
    No existen servidores registrados.{' '}
    <Link to={routes.newServidor()} className="rw-link">
      Crear uno nuevo
    </Link>
  </div>
)

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ servidores }) => {
  return <Servidores servidores={servidores} />
}