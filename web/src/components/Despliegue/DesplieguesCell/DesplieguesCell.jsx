import { Link, routes } from '@redwoodjs/router'

import Despliegues from 'src/components/Despliegue/Despliegues'

export const QUERY = gql`
  query FindDespliegues {
    despliegues {
      id
      id_componente
      id_maquina
      fecha_despliegue
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
      fecha_solicitud
      unidad_solicitante
      solicitante
      cod_tipo_respaldo
      referencia_respaldo
      estado_despliegue
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => {
  return (
    <div className="rw-text-center">
      {'No despliegues yet. '}
      <Link to={routes.newDespliegue()} className="rw-link">
        {'Create one?'}
      </Link>
    </div>
  )
}

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ despliegues }) => {
  return <Despliegues despliegues={despliegues} />
}
