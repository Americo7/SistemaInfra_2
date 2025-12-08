import { Link, routes } from '@redwoodjs/router'
import { gql } from '@redwoodjs/web'
// Importación con ruta absoluta
import Despliegues from 'src/components/Despliegue/Despliegues/Despliegues'

export const QUERY = gql`
  query FindDespliegues {
    despliegues {
      id
      id_componente
      id_maquina
      id_servidor
      descripcion
      fecha_despliegue
      estado
      fecha_solicitud
      unidad_solicitante
      solicitante
      cod_tipo_respaldo
      referencia_respaldo
      estado_despliegue
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
      tipoRespaldoInfo {
        id
        codigo
        nombre
      }
      estadoDespliegueInfo {
        id
        codigo
        nombre
      }
    }
    parametrosFormularioDespliegue {
      id
      codigo
      nombre
      grupo
    }
  }
`

export const Loading = () => <div>Cargando despliegues...</div>

export const Empty = () => (
  <div className="rw-text-center">
    No existen despliegues registrados.{' '}
    <Link to={routes.newDespliegue()} className="rw-link">
      Crear uno nuevo
    </Link>
  </div>
)

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ despliegues, parametrosFormularioDespliegue }) => {
  return <Despliegues despliegues={despliegues} parametros={parametrosFormularioDespliegue} />
}