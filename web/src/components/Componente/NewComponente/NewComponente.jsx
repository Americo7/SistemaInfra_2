import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import ComponenteForm from 'src/components/Componente/ComponenteForm'

const CREATE_COMPONENTE_MUTATION = gql`
  mutation CreateComponenteMutation($input: CreateComponenteInput!) {
    createComponente(input: $input) {
      id
    }
  }
`

const NewComponente = () => {
  const [createComponente, { loading, error }] = useMutation(
    CREATE_COMPONENTE_MUTATION,
    {
      onCompleted: () => {
        toast.success('Componente created')
        navigate(routes.componentes())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input) => {
    createComponente({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <div className="rw-segment-main">
        <ComponenteForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewComponente
