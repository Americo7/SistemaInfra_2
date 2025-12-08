import { gql } from '@redwoodjs/web'
import Despliegue from 'src/components/Despliegue/Despliegue'

export const QUERY = gql`
  query FindDespliegueBase($id: Int!) {
    despliegue: despliegue(id: $id) {
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
      componentes {
        id
        nombre
        dominio
        descripcion
        sistemas {
          id
          nombre
        }
      }
      maquinas {
        id
        nombre
        ip
        so
        ram
        cpu
      }
      servidores {
        id
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

export const Loading = () => <div>Cargando despliegue...</div>

export const Empty = () => <div>Despliegue no encontrado</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ despliegue, parametrosFormularioDespliegue }) => {
  return (
    <Despliegue
      despliegue={despliegue}
      componente={despliegue.componentes}
      maquina={despliegue.maquinas}
      servidor={despliegue.servidores}
      parametros={parametrosFormularioDespliegue}
    />
  )
}
