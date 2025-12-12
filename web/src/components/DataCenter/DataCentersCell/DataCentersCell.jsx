import { gql } from '@redwoodjs/web'
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
      # Relaciones si las necesitas directamente, aunque tu tabla usa mapeo manual
      creadoPor {
        id
        nombres
        primer_apellido
        segundo_apellido
      }
      modificadoPor {
        id
        nombres
        primer_apellido
        segundo_apellido
      }
    }
    # Agregamos usuarios para que el filtro de nombres funcione
    usuarios {
      id
      nombres
      primer_apellido
      segundo_apellido
    }
  }
`

export const Loading = () => <div>Cargando Data centers...</div>

// TRUCO: Al devolver 'false', forzamos a Redwood a usar el componente Success
// incluso si el array está vacío. Así veremos la tabla vacía con el botón "Nuevo".
export const isEmpty = () => false

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ dataCenters, usuarios }) => {
  // Pasamos tanto los dataCenters como los usuarios al componente
  return <DataCenters dataCenters={dataCenters} usuarios={usuarios} />
}