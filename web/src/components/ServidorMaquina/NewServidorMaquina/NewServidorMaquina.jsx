import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import ServidorMaquinaForm from 'src/components/ServidorMaquina/ServidorMaquinaForm'

const CREATE_SERVIDOR_MAQUINA_MUTATION = gql`
  mutation CreateServidorMaquinaMutation($input: CreateServidorMaquinaInput!) {
    createServidorMaquina(input: $input) {
      id
    }
  }
`

const NewServidorMaquina = () => {
  const [createServidorMaquina, { loading, error }] = useMutation(
    CREATE_SERVIDOR_MAQUINA_MUTATION,
    {
      onCompleted: () => {
        toast.success('ServidorMaquina created')
        navigate(routes.servidorMaquinas())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input) => {
    createServidorMaquina({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New ServidorMaquina</h2>
      </header>
      <div className="rw-segment-main">
        <ServidorMaquinaForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewServidorMaquina
