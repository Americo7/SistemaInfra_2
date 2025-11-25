import { Link, routes } from '@redwoodjs/router'
import Servidores from 'src/components/Servidor/Servidors'

export const QUERY = gql`
  query FindServidores {
    servidores {
      id
      cod_inventario_agetic
      nombre
      ip_primaria
      sistema_operativo
      ram
      almacenamiento
      estado_operativo
      estado

      id_data_center
      data_centers {
        nombre
      }

      serie
      id_padre
      servidores_padre { # <-- AGREGADO para evitar consulta extra
        nombre
      }

      cod_tipo_servidor
      marca
      modelo
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
  }
`

export const Loading = () => <div>Cargando servidores...</div>

export const Empty = () => (
  <div className="rw-text-center">
    {'No hay servidores registrados. '}
    <Link to={routes.newServidor()} className="rw-link">
      {'Crear nuevo'}
    </Link>
  </div>
)

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error.message}</div>
)

export const Success = ({ servidores }) => {
  return <Servidores servidores={servidores} />
}