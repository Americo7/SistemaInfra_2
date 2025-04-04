import { navigate, routes } from '@redwoodjs/router'

import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import AsignacionServidorMaquinaForm from 'src/components/AsignacionServidorMaquina/AsignacionServidorMaquinaForm'

export const QUERY = gql`
  query EditAsignacionServidorMaquinaById($id: Int!) {
    asignacionServidorMaquina: asignacionServidorMaquina(id: $id) {
      id
      id_servidor
      id_maquina
      id_cluster
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
  }
`

const UPDATE_ASIGNACION_SERVIDOR_MAQUINA_MUTATION = gql`
  mutation UpdateAsignacionServidorMaquinaMutation(
    $id: Int!
    $input: UpdateAsignacionServidorMaquinaInput!
  ) {
    updateAsignacionServidorMaquina(id: $id, input: $input) {
      id
      id_servidor
      id_maquina
      id_cluster
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

export const Success = ({ asignacionServidorMaquina }) => {
  const [updateAsignacionServidorMaquina, { loading, error }] = useMutation(
    UPDATE_ASIGNACION_SERVIDOR_MAQUINA_MUTATION,
    {
      onCompleted: () => {
        toast.success('AsignacionServidorMaquina updated')
        navigate(routes.asignacionServidorMaquinas())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input, id) => {
    updateAsignacionServidorMaquina({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit AsignacionServidorMaquina {asignacionServidorMaquina?.id}
        </h2>
      </header>
      <div className="rw-segment-main">
        <AsignacionServidorMaquinaForm
          asignacionServidorMaquina={asignacionServidorMaquina}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
