import { navigate, routes } from '@redwoodjs/router'

import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import DataCenterForm from 'src/components/DataCenter/DataCenterForm'

export const QUERY = gql`
  query EditDataCenterById($id: Int!) {
    dataCenter: dataCenter(id: $id) {
      id
      nombre
      ubicacion
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
  }
`

const UPDATE_DATA_CENTER_MUTATION = gql`
  mutation UpdateDataCenterMutation($id: Int!, $input: UpdateDataCenterInput!) {
    updateDataCenter(id: $id, input: $input) {
      id
      nombre
      ubicacion
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

export const Success = ({ dataCenter }) => {
  const [updateDataCenter, { loading, error }] = useMutation(
    UPDATE_DATA_CENTER_MUTATION,
    {
      onCompleted: () => {
        toast.success('DataCenter updated')
        navigate(routes.dataCenters())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input, id) => {
    updateDataCenter({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit DataCenter {dataCenter?.id}
        </h2>
      </header>
      <div className="rw-segment-main">
        <DataCenterForm
          dataCenter={dataCenter}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
