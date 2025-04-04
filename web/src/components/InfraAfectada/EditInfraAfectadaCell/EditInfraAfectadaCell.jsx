import { navigate, routes } from '@redwoodjs/router'

import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import InfraAfectadaForm from 'src/components/InfraAfectada/InfraAfectadaForm'

export const QUERY = gql`
  query EditInfraAfectadaById($id: Int!) {
    infraAfectada: infraAfectada(id: $id) {
      id
      id_evento
      id_data_center
      id_hardware
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

const UPDATE_INFRA_AFECTADA_MUTATION = gql`
  mutation UpdateInfraAfectadaMutation(
    $id: Int!
    $input: UpdateInfraAfectadaInput!
  ) {
    updateInfraAfectada(id: $id, input: $input) {
      id
      id_evento
      id_data_center
      id_hardware
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

export const Success = ({ infraAfectada }) => {
  const [updateInfraAfectada, { loading, error }] = useMutation(
    UPDATE_INFRA_AFECTADA_MUTATION,
    {
      onCompleted: () => {
        toast.success('InfraAfectada updated')
        navigate(routes.infraAfectadas())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input, id) => {
    updateInfraAfectada({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit InfraAfectada {infraAfectada?.id}
        </h2>
      </header>
      <div className="rw-segment-main">
        <InfraAfectadaForm
          infraAfectada={infraAfectada}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
