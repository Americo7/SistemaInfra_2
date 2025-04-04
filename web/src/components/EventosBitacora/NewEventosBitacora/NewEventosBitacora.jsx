import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import EventosBitacoraForm from 'src/components/EventosBitacora/EventosBitacoraForm'

const CREATE_EVENTOS_BITACORA_MUTATION = gql`
  mutation CreateEventosBitacoraMutation($input: CreateEventosBitacoraInput!) {
    createEventosBitacora(input: $input) {
      id
    }
  }
`

const NewEventosBitacora = () => {
  const [createEventosBitacora, { loading, error }] = useMutation(
    CREATE_EVENTOS_BITACORA_MUTATION,
    {
      onCompleted: () => {
        toast.success('EventosBitacora created')
        navigate(routes.eventosBitacoras())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input) => {
    createEventosBitacora({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New EventosBitacora</h2>
      </header>
      <div className="rw-segment-main">
        <EventosBitacoraForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewEventosBitacora
