import { navigate, routes } from '@redwoodjs/router'
import { useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import DespliegueForm from 'src/components/Despliegue/DespliegueForm'

/* ============================================================
   QUERY
   - Trae: despliegue + componentes, máquinas, servidores, parámetros
   - Todo en una sola consulta para optimización
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
    }
    componentes {
      id
      nombre
      estado
    }
    maquinas {
      id
      nombre
      estado
    }
    servidores {
      id
      nombre
      estado
    }
    parametros {
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

export const Loading = () => <div>Loading...</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ despliegue, componentes, maquinas, servidores, parametros }) => {
  const [updateDespliegue, { loading, error }] = useMutation(
    UPDATE_DESPLIEGUE_MUTATION,
    {
      onCompleted: () => {
        toast.success('Despliegue actualizado')
        navigate(routes.despliegues())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input, id) => {
    const cleanInput = {
      id_componente: input.id_componente,
      id_maquina: input.id_maquina || null,
      id_servidor: input.id_servidor || null,
      descripcion: input.descripcion,
      fecha_despliegue: input.fecha_despliegue,
      estado: input.estado,
      fecha_solicitud: input.fecha_solicitud,
      unidad_solicitante: input.unidad_solicitante,
      solicitante: input.solicitante,
      cod_tipo_respaldo: input.cod_tipo_respaldo,
      referencia_respaldo: input.referencia_respaldo,
      estado_despliegue: input.estado_despliegue,
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
