import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import ParametroForm from 'src/components/Parametro/ParametroForm'

const CREATE_PARAMETRO_MUTATION = gql`
  mutation CreateParametroMutation($input: CreateParametroInput!) {
    createParametro(input: $input) {
      id
    }
  }
`

const NewParametro = () => {
  const [createParametro, { loading, error }] = useMutation(
    CREATE_PARAMETRO_MUTATION,
    {
      onCompleted: () => {
        toast.success('Parametro created')
        navigate(routes.parametros())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input) => {
    createParametro({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New Parametro</h2>
      </header>
      <div className="rw-segment-main">
        <ParametroForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewParametro
