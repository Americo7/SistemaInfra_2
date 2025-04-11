import { Link, routes } from '@redwoodjs/router'
import Servidores from 'src/components/Servidor/Servidors'

export const QUERY = gql`
  query FindServidor {
    servidores {
      id
      cod_inventario_agetic
      nombre

      ram
      almacenamiento
      estado_operativo
      estado
      id_data_center
      serie
      id_padre
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

export const Loading = () => <div>Cargando...</div>

export const Empty = () => (
  <div className="rw-text-center">
    No hay servidores registrados.{' '}
    <Link to={routes.newServidor()} className="rw-link">
      Crear nuevo
    </Link>
  </div>
)

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error.message}</div>
)

export const Success = ({ servidores }) => (
  <Servidores servidores={servidores} />
)
