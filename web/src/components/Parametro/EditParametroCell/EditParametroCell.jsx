import { navigate, routes } from '@redwoodjs/router'

import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import ParametroForm from 'src/components/Parametro/ParametroForm'

export const QUERY = gql`
  query EditParametroById($id: Int!) {
    parametro: parametro(id: $id) {
      id
      codigo
      nombre
      grupo
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
      descripcion
    }
  }
`

const UPDATE_PARAMETRO_MUTATION = gql`
  mutation UpdateParametroMutation($id: Int!, $input: UpdateParametroInput!) {
    updateParametro(id: $id, input: $input) {
      id
      codigo
      nombre
      grupo
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
      descripcion
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ parametro }) => {
  const [updateParametro, { loading, error }] = useMutation(
    UPDATE_PARAMETRO_MUTATION,
    {
      onCompleted: () => {
        toast.success('Parametro updated')
        navigate(routes.parametros())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input, id) => {
    updateParametro({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit Parametro {parametro?.id}
        </h2>
      </header>
      <div className="rw-segment-main">
        <ParametroForm
          parametro={parametro}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
