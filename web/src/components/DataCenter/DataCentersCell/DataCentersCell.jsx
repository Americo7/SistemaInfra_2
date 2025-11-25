import { Link, routes } from '@redwoodjs/router'

import DataCenters from 'src/components/DataCenter/DataCenters'

export const QUERY = gql`
  query FindDataCenters {
    dataCenters {
      id
      nombre
      ubicacion
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
      {'No dataCenters yet. '}
      <Link to={routes.newDataCenter()} className="rw-link">
        {'Create one?'}
      </Link>
    </div>
  )
}

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ dataCenters }) => {
  return <DataCenters dataCenters={dataCenters} />
}
