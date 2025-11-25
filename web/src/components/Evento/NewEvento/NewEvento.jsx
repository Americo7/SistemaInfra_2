import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import EventoForm from 'src/components/Evento/EventoForm'

const CREATE_EVENTO_MUTATION = gql`
  mutation CreateEventoMutation($input: CreateEventoInput!) {
    createEvento(input: $input) {
      id
    }
  }
`

const NewEvento = () => {
  const [createEvento, { loading, error }] = useMutation(
    CREATE_EVENTO_MUTATION,
    {
      onCompleted: () => {
        toast.success('Evento created')
        navigate(routes.eventos())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input) => {
    createEvento({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New Evento</h2>
      </header>
      <div className="rw-segment-main">
        <EventoForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewEvento
