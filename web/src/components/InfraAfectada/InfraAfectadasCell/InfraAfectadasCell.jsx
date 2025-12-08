import { Link, routes } from '@redwoodjs/router'
import { gql } from '@redwoodjs/web'
// Ruta absoluta para evitar errores
import InfraAfectadas from 'src/components/InfraAfectada/InfraAfectadas/InfraAfectadas'

export const QUERY = gql`
  query FindInfraAfectadas {
    infraAfectadas {
      id
      id_evento
      id_data_center
      id_servidor
      id_maquina
      estado
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
    }
  }
`

export const Loading = () => <div>Cargando registros de infraestructura afectada...</div>

export const Empty = () => (
  <div className="rw-text-center">
    No existen registros.{' '}
    <Link to={routes.newInfraAfectada()} className="rw-link">
      Crear uno nuevo
    </Link>
  </div>
)

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ infraAfectadas }) => {
  return <InfraAfectadas infraAfectadas={infraAfectadas} />
}