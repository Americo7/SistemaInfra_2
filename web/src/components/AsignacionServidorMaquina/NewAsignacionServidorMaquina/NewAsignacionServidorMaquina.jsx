import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import AsignacionServidorMaquinaForm from 'src/components/AsignacionServidorMaquina/AsignacionServidorMaquinaForm'

const CREATE_ASIGNACION_SERVIDOR_MAQUINA_MUTATION = gql`
  mutation CreateAsignacionServidorMaquinaMutation(
    $input: CreateAsignacionServidorMaquinaInput!
  ) {
    createAsignacionServidorMaquina(input: $input) {
      id
    }
  }
`

const NewAsignacionServidorMaquina = () => {
  const [createAsignacionServidorMaquina, { loading, error }] = useMutation(
    CREATE_ASIGNACION_SERVIDOR_MAQUINA_MUTATION,
    {
      onCompleted: () => {
        toast.success('AsignacionServidorMaquina created')
        navigate(routes.asignacionServidorMaquinas())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input) => {
    createAsignacionServidorMaquina({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          New AsignacionServidorMaquina
        </h2>
      </header>
      <div className="rw-segment-main">
        <AsignacionServidorMaquinaForm
          onSave={onSave}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  )
}

export default NewAsignacionServidorMaquina
