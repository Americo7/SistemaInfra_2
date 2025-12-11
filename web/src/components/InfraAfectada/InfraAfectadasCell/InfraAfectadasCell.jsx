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
      fecha_creacion
      fecha_modificacion
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
      eventos {
        id
        cod_evento
        tipoEventoInfo {
          id
          codigo
          nombre
        }
      }
      data_centers {
        id
        nombre
      }
      servidores {
        id
        nombre
      }
      maquinas {
        id
        nombre
      }
    }
  }
`

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ infraAfectadas }) => {
  return <InfraAfectadas infraAfectadas={infraAfectadas} />
}