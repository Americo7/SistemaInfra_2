import { navigate, routes } from '@redwoodjs/router'

import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import HardwareForm from 'src/components/Hardware/HardwareForm'

export const QUERY = gql`
  query EditHardwareById($id: Int!) {
    hardware: hardware(id: $id) {
      id
      id_data_center
      serie
      cod_activo_agetic
      cod_tipo_hw
      marca
      modelo
      estado_operativo
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
  }
`

const UPDATE_HARDWARE_MUTATION = gql`
  mutation UpdateHardwareMutation($id: Int!, $input: UpdateHardwareInput!) {
    updateHardware(id: $id, input: $input) {
      id
      id_data_center
      serie
      cod_activo_agetic
      cod_tipo_hw
      marca
      modelo
      estado_operativo
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

export const Success = ({ hardware }) => {
  const [updateHardware, { loading, error }] = useMutation(
    UPDATE_HARDWARE_MUTATION,
    {
      onCompleted: () => {
        toast.success('Hardware updated')
        navigate(routes.hardwares())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input, id) => {
    updateHardware({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit Hardware {hardware?.id}
        </h2>
      </header>
      <div className="rw-segment-main">
        <HardwareForm
          hardware={hardware}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
