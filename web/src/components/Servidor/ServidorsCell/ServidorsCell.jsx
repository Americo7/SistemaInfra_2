import { Link, routes } from '@redwoodjs/router'

import Servidors from 'src/components/Servidor/Servidors'

export const QUERY = gql`
  query FindServidors {
    servidors {
      id
      id_hardware
      serie_servidor
      cod_inventario_agetic
      chasis
      cuchilla
      ram
      almacenamiento
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
      {'No servidors yet. '}
      <Link to={routes.newServidor()} className="rw-link">
        {'Create one?'}
      </Link>
    </div>
  )
}

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ servidors }) => {
  return <Servidors servidors={servidors} />
}
