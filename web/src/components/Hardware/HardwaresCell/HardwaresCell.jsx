import { Link, routes } from '@redwoodjs/router'

import Hardwares from 'src/components/Hardware/Hardwares'

export const QUERY = gql`
  query FindHardwares {
    hardwares {
      id
      id_data_center
      serie
      cod_activo_agetic
      cod_tipo_hw
      marca
      modelo
      estado_operativo
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
      {'No hardwares yet. '}
      <Link to={routes.newHardware()} className="rw-link">
        {'Create one?'}
      </Link>
    </div>
  )
}

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ hardwares }) => {
  return <Hardwares hardwares={hardwares} />
}
