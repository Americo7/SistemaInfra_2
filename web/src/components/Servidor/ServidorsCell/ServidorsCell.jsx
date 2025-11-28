import { Link, routes } from '@redwoodjs/router'
import Servidores from 'src/components/Servidor/Servidors'

// QUERIES DE LISTA: Optimizadas para velocidad.
// Solo pedimos campos primitivos y relaciones directas que ya incluimos en el backend.
export const QUERY = gql`
  query FindServidores {
    servidores {
      id
      nombre
      id_data_center
      id_padre
      cod_inventario_agetic
      cod_tipo_servidor
      serie
      marca
      modelo
      ram
      almacenamiento
      ip_primaria
      sistema_operativo
      estado_operativo
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
      identity_key
      data_centers {
        id
        nombre
      }
      servidores_padre {
        id
        nombre
      }
    }
  }
`

export const Loading = () => <div className="rw-text-center">Cargando servidores...</div>

export const Empty = () => (
  <div className="rw-text-center">
    {'No hay servidores registrados. '}
    <Link to={routes.newServidor()} className="rw-link">
      {'Crear nuevo'}
    </Link>
  </div>
)

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ servidores }) => {
  return <Servidores servidores={servidores} />
}