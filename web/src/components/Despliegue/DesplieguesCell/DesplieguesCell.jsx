import { Link, routes } from '@redwoodjs/router'
import Despliegues from 'src/components/Despliegue/Despliegues'

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

      componentes {
        id
        nombre
        sistemas {
          id
          nombre
        }
      }

      maquinas {
        id
        nombre
        servidores {
          id
          nombre
          cod_tipo_servidor
          id_padre
        }
      }

      servidores {
        id
        nombre
        cod_tipo_servidor
        id_padre
      }

      despliegue_bitacora {
        id
        estado_anterior
        estado_actual
        descripcion
        fecha_creacion
      }
    }

    usuarios: usuarios {
      id
      nombres
      primer_apellido
      segundo_apellido
    }

    parametros {
      id
      codigo
      nombre
      grupo
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

export const Success = ({
  despliegues,
  usuarios,
  parametros,
}) => {
  return (
    <Despliegues
      despliegues={despliegues}
      usuarios={usuarios}
      parametros={parametros}
    />
  )
}
