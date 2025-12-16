import { navigate, routes } from '@redwoodjs/router'
import { useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import DespliegueForm from 'src/components/Despliegue/DespliegueForm'

/* ============================================================
   QUERY
=============================================================== */
export const QUERY = gql`
  query EditDespliegueById($id: Int!) {
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
      
      # --- NUEVOS CAMPOS ---
      version_aplicacion
      git_commit
      tipo_despliegue
      # ---------------------

      unidadInfo {
        id
        codigo
        nombre
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
    # Listas para los selectores del formulario
    componentes {
      id
      nombre
      estado
      sistemas {
        id
        nombre
        sigla
      }
    }
    maquinas {
      id
      nombre
      estado
      ip 
    }
    servidores {
      id
      nombre
      estado
      ip_primaria 
    }
    parametros: parametrosFormularioDespliegue {
      id
      codigo
      nombre
      grupo
    }
  }
`

/* ============================================================
   MUTATION
=============================================================== */
const UPDATE_DESPLIEGUE_MUTATION = gql`
  mutation UpdateDespliegueMutation($id: Int!, $input: UpdateDespliegueInput!) {
    updateDespliegue(id: $id, input: $input) {
      id
      estado
      fecha_modificacion
    }
  }
`

/* ============================================================
   COMPONENTES REDWOODJS CELL
=============================================================== */

export const Loading = () => <div>Cargando...</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ despliegue, componentes, maquinas, servidores, parametros }) => {
  const [updateDespliegue, { loading, error }] = useMutation(
    UPDATE_DESPLIEGUE_MUTATION,
    {
      onCompleted: () => {
        toast.success('Despliegue actualizado correctamente')
        navigate(routes.despliegues())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input, id) => {
    // Limpieza de datos según el tipo de infraestructura seleccionado
    const cleanInput = {
      id_componente: input.id_componente,
      id_maquina: input.id_maquina || null,   // Si es físico, esto debe ir null
      id_servidor: input.id_servidor || null, // Si es virtual, esto debe ir null
      descripcion: input.descripcion,
      fecha_despliegue: input.fecha_despliegue,
      estado: input.estado,
      fecha_solicitud: input.fecha_solicitud,
      unidad_solicitante: input.unidad_solicitante,
      solicitante: input.solicitante,
      cod_tipo_respaldo: input.cod_tipo_respaldo,
      referencia_respaldo: input.referencia_respaldo,
      estado_despliegue: input.estado_despliegue,
      
      // --- NUEVOS CAMPOS EN UPDATE ---
      version_aplicacion: input.version_aplicacion,
      git_commit: input.git_commit,
      tipo_despliegue: input.tipo_despliegue,
    }

    updateDespliegue({ variables: { id, input: cleanInput } })
  }

  return (
    <div className="rw-segment">
      <div className="rw-segment-main">
        <DespliegueForm
          despliegue={despliegue}
          componentes={componentes}
          maquinas={maquinas}
          servidores={servidores}
          parametros={parametros}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}