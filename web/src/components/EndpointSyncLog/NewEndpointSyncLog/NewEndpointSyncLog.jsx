import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import EndpointSyncLogForm from 'src/components/EndpointSyncLog/EndpointSyncLogForm'

const CREATE_ENDPOINT_SYNC_LOG_MUTATION = gql`
  mutation CreateEndpointSyncLogMutation($input: CreateEndpointSyncLogInput!) {
    createEndpointSyncLog(input: $input) {
      id
    }
  }
`

const NewEndpointSyncLog = () => {
  const [createEndpointSyncLog, { loading, error }] = useMutation(
    CREATE_ENDPOINT_SYNC_LOG_MUTATION,
    {
      onCompleted: () => {
        toast.success('EndpointSyncLog created')
        navigate(routes.endpointSyncLogs())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input) => {
    createEndpointSyncLog({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New EndpointSyncLog</h2>
      </header>
      <div className="rw-segment-main">
        <EndpointSyncLogForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewEndpointSyncLog
