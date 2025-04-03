import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import MaquinaForm from 'src/components/Maquina/MaquinaForm'

const CREATE_MAQUINA_MUTATION = gql`
  mutation CreateMaquinaMutation($input: CreateMaquinaInput!) {
    createMaquina(input: $input) {
      id
    }
  }
`

const NewMaquina = () => {
  const [createMaquina, { loading, error }] = useMutation(
    CREATE_MAQUINA_MUTATION,
    {
      onCompleted: () => {
        toast.success('Maquina created')
        navigate(routes.maquinas())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input) => {
    createMaquina({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New Maquina</h2>
      </header>
      <div className="rw-segment-main">
        <MaquinaForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewMaquina
