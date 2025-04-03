import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import HardwareForm from 'src/components/Hardware/HardwareForm'

const CREATE_HARDWARE_MUTATION = gql`
  mutation CreateHardwareMutation($input: CreateHardwareInput!) {
    createHardware(input: $input) {
      id
    }
  }
`

const NewHardware = () => {
  const [createHardware, { loading, error }] = useMutation(
    CREATE_HARDWARE_MUTATION,
    {
      onCompleted: () => {
        toast.success('Hardware created')
        navigate(routes.hardwares())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input) => {
    createHardware({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New Hardware</h2>
      </header>
      <div className="rw-segment-main">
        <HardwareForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewHardware
