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

      # RELACIONES AUTOMÁTICAS
      componentes {
        id
        nombre
        dominio
        descripcion
        cod_entorno
        cod_categoria
        tecnologia
        estado

        sistemas {
          id
          nombre
          sigla
          codigo
          descripcion
          estado
        }
      }

      maquinas {
        id
        nombre
        ip
        so
        ram
        cpu
        cod_plataforma
        estado
        fecha_creacion
        usuario_creacion

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
        fecha_creacion
        usuario_creacion
        descripcion
      }
    }

    usuarios {
      id
      nombres
      primer_apellido
      segundo_apellido
    }

    parametros {
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

export const Success = ({ despliegue, usuarios, parametros }) => {
  return (
    <Despliegue
      despliegue={despliegue}
      componente={despliegue.componentes}
      maquina={despliegue.maquinas}
      servidor={despliegue.servidores}
      bitacora={despliegue.despliegue_bitacora}
      usuarios={usuarios}
      parametros={parametros}
    />
  )
}
