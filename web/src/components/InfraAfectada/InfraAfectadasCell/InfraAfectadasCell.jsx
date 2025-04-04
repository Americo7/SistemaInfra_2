import { Link, routes } from '@redwoodjs/router'

import InfraAfectadas from 'src/components/InfraAfectada/InfraAfectadas'

export const QUERY = gql`
  query FindInfraAfectadas {
    infraAfectadas {
      id
      id_evento
      id_data_center
      id_hardware
      id_servidor
      id_maquina
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return (
    <div className="rw-text-center">
      {'No infraAfectadas yet. '}
      <Link to={routes.newInfraAfectada()} className="rw-link">
        {'Create one?'}
      </Link>
    </div>
  )
}

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ infraAfectadas }) => {
  return <InfraAfectadas infraAfectadas={infraAfectadas} />
}
