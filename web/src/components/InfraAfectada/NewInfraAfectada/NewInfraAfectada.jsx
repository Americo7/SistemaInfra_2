import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import InfraAfectadaForm from 'src/components/InfraAfectada/InfraAfectadaForm'

const CREATE_INFRA_AFECTADA_MUTATION = gql`
  mutation CreateInfraAfectadaMutation($input: CreateInfraAfectadaInput!) {
    createInfraAfectada(input: $input) {
      id
    }
  }
`

const NewInfraAfectada = () => {
  const [createInfraAfectada, { loading, error }] = useMutation(
    CREATE_INFRA_AFECTADA_MUTATION,
    {
      onCompleted: () => {
        toast.success('InfraAfectada created')
        navigate(routes.infraAfectadas())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input) => {
    createInfraAfectada({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New InfraAfectada</h2>
      </header>
      <div className="rw-segment-main">
        <InfraAfectadaForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewInfraAfectada
