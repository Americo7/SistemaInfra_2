import { navigate, routes } from '@redwoodjs/router'

import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import EventosBitacoraForm from 'src/components/EventosBitacora/EventosBitacoraForm'

export const QUERY = gql`
  query EditEventosBitacoraById($id: Int!) {
    eventosBitacora: eventosBitacora(id: $id) {
      id
      id_evento
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
      estado_anterior
      estado_actual
    }
  }
`

const UPDATE_EVENTOS_BITACORA_MUTATION = gql`
  mutation UpdateEventosBitacoraMutation(
    $id: Int!
    $input: UpdateEventosBitacoraInput!
  ) {
    updateEventosBitacora(id: $id, input: $input) {
      id
      id_evento
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
      estado_anterior
      estado_actual
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ eventosBitacora }) => {
  const [updateEventosBitacora, { loading, error }] = useMutation(
    UPDATE_EVENTOS_BITACORA_MUTATION,
    {
      onCompleted: () => {
        toast.success('EventosBitacora updated')
        navigate(routes.eventosBitacoras())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input, id) => {
    updateEventosBitacora({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit EventosBitacora {eventosBitacora?.id}
        </h2>
      </header>
      <div className="rw-segment-main">
        <EventosBitacoraForm
          eventosBitacora={eventosBitacora}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
