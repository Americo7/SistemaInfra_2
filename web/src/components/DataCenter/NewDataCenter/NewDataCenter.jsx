import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import DataCenterForm from 'src/components/DataCenter/DataCenterForm'

const CREATE_DATA_CENTER_MUTATION = gql`
  mutation CreateDataCenterMutation($input: CreateDataCenterInput!) {
    createDataCenter(input: $input) {
      id
    }
  }
`

const NewDataCenter = () => {
  const [createDataCenter, { loading, error }] = useMutation(
    CREATE_DATA_CENTER_MUTATION,
    {
      onCompleted: () => {
        toast.success('DataCenter created')
        navigate(routes.dataCenters())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input) => {
    createDataCenter({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New DataCenter</h2>
      </header>
      <div className="rw-segment-main">
        <DataCenterForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewDataCenter
