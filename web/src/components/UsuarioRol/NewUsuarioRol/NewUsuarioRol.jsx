import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'

import { toast } from '@redwoodjs/web/toast'

import UsuarioRolForm from 'src/components/UsuarioRol/UsuarioRolForm'

const CREATE_USUARIO_ROL_MUTATION = gql`
  mutation CreateUsuarioRolMutation($input: CreateUsuarioRolInput!) {
    createUsuarioRol(input: $input) {
      id
    }
  }
`

const NewUsuarioRol = () => {
  const [createUsuarioRol, { loading, error }] = useMutation(
    CREATE_USUARIO_ROL_MUTATION,
    {
      onCompleted: () => {
        toast.success('UsuarioRol created')
        navigate(routes.usuarioRols())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input) => {
    createUsuarioRol({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">New UsuarioRol</h2>
      </header>
      <div className="rw-segment-main">
        <UsuarioRolForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewUsuarioRol
