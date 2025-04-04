import { navigate, routes } from '@redwoodjs/router'

import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import DespliegueBitacoraForm from 'src/components/DespliegueBitacora/DespliegueBitacoraForm'

export const QUERY = gql`
  query EditDespliegueBitacoraById($id: Int!) {
    despliegueBitacora: despliegueBitacora(id: $id) {
      id
      id_despliegue
      estado_anterior
      estado_actual
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
  }
`

const UPDATE_DESPLIEGUE_BITACORA_MUTATION = gql`
  mutation UpdateDespliegueBitacoraMutation(
    $id: Int!
    $input: UpdateDespliegueBitacoraInput!
  ) {
    updateDespliegueBitacora(id: $id, input: $input) {
      id
      id_despliegue
      estado_anterior
      estado_actual
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ despliegueBitacora }) => {
  const [updateDespliegueBitacora, { loading, error }] = useMutation(
    UPDATE_DESPLIEGUE_BITACORA_MUTATION,
    {
      onCompleted: () => {
        toast.success('DespliegueBitacora updated')
        navigate(routes.despliegueBitacoras())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input, id) => {
    updateDespliegueBitacora({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit DespliegueBitacora {despliegueBitacora?.id}
        </h2>
      </header>
      <div className="rw-segment-main">
        <DespliegueBitacoraForm
          despliegueBitacora={despliegueBitacora}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
