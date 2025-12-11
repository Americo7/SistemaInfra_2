import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import EventoForm from 'src/components/Evento/EventoForm'

const CREATE_EVENTO_MUTATION = gql`
  mutation CreateEventoMutation($input: CreateEventoInput!) {
    createEvento(input: $input) {
      id
      cod_evento
    }
  }
`

const NewEvento = () => {
  const [createEvento, { loading, error }] = useMutation(
    CREATE_EVENTO_MUTATION,
    {
      onCompleted: (data) => {
        const codigo = data.createEvento.cod_evento

        navigate(routes.eventos({ new: codigo }))
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = async (input) => {
    const { data } = await createEvento({ variables: { input } })
    return data?.createEvento
  }

  return (
    <div className="rw-segment">
      <div className="rw-segment-main">
        <EventoForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewEvento