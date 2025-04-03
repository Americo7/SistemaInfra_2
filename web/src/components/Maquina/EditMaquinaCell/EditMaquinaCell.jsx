import { navigate, routes } from '@redwoodjs/router'

import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import MaquinaForm from 'src/components/Maquina/MaquinaForm'

export const QUERY = gql`
  query EditMaquinaById($id: Int!) {
    maquina: maquina(id: $id) {
      id
      codigo
      cod_tipo_maquina
      nombre
      ip
      so
      ram
      almacenamiento
      cpu
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
  }
`

const UPDATE_MAQUINA_MUTATION = gql`
  mutation UpdateMaquinaMutation($id: Int!, $input: UpdateMaquinaInput!) {
    updateMaquina(id: $id, input: $input) {
      id
      codigo
      cod_tipo_maquina
      nombre
      ip
      so
      ram
      almacenamiento
      cpu
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

export const Success = ({ maquina }) => {
  const [updateMaquina, { loading, error }] = useMutation(
    UPDATE_MAQUINA_MUTATION,
    {
      onCompleted: () => {
        toast.success('Maquina updated')
        navigate(routes.maquinas())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input, id) => {
    updateMaquina({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit Maquina {maquina?.id}
        </h2>
      </header>
      <div className="rw-segment-main">
        <MaquinaForm
          maquina={maquina}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
