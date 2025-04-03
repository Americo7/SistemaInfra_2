import { navigate, routes } from '@redwoodjs/router'

import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import ServidorMaquinaForm from 'src/components/ServidorMaquina/ServidorMaquinaForm'

export const QUERY = gql`
  query EditServidorMaquinaById($id: Int!) {
    servidorMaquina: servidorMaquina(id: $id) {
      id
      id_servidor
      id_maquina
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
  }
`

const UPDATE_SERVIDOR_MAQUINA_MUTATION = gql`
  mutation UpdateServidorMaquinaMutation(
    $id: Int!
    $input: UpdateServidorMaquinaInput!
  ) {
    updateServidorMaquina(id: $id, input: $input) {
      id
      id_servidor
      id_maquina
      estado
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

export const Success = ({ servidorMaquina }) => {
  const [updateServidorMaquina, { loading, error }] = useMutation(
    UPDATE_SERVIDOR_MAQUINA_MUTATION,
    {
      onCompleted: () => {
        toast.success('ServidorMaquina updated')
        navigate(routes.servidorMaquinas())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input, id) => {
    updateServidorMaquina({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit ServidorMaquina {servidorMaquina?.id}
        </h2>
      </header>
      <div className="rw-segment-main">
        <ServidorMaquinaForm
          servidorMaquina={servidorMaquina}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
