import { navigate, routes } from '@redwoodjs/router'

import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import UsuarioRolForm from 'src/components/UsuarioRol/UsuarioRolForm'

export const QUERY = gql`
  query EditUsuarioRolById($id: Int!) {
    usuarioRol: usuarioRol(id: $id) {
      id
      id_usuario
      id_rol
      id_maquina
      id_sistema
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
  }
`

const UPDATE_USUARIO_ROL_MUTATION = gql`
  mutation UpdateUsuarioRolMutation($id: Int!, $input: UpdateUsuarioRolInput!) {
    updateUsuarioRol(id: $id, input: $input) {
      id
      id_usuario
      id_rol
      id_maquina
      id_sistema
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

export const Success = ({ usuarioRol }) => {
  const [updateUsuarioRol, { loading, error }] = useMutation(
    UPDATE_USUARIO_ROL_MUTATION,
    {
      onCompleted: () => {
        toast.success('UsuarioRol updated')
        navigate(routes.usuarioRols())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input, id) => {
    updateUsuarioRol({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit UsuarioRol {usuarioRol?.id}
        </h2>
      </header>
      <div className="rw-segment-main">
        <UsuarioRolForm
          usuarioRol={usuarioRol}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
