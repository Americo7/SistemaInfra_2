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
        const toastId = 'usuario-rol-success' // Definimos el ID
        
        // 1. Mostrar mensaje
        toast.success('Rol asignado correctamente', { id: toastId })
        
        // 2. Esperar 1 segundo para leer, cerrar y navegar
        setTimeout(() => {
          toast.dismiss(toastId) // <--- ESTO ELIMINA EL MENSAJE ANTES DE IRSE
          navigate(routes.usuarioRols())
        }, 1000)
      },
      onError: (error) => {
        toast.error(error.message, { id: 'usuario-rol-error' })
      },
    }
  )

  const onSave = (input) => {
    createUsuarioRol({ variables: { input } })
  }

  return (
    <div className="rw-segment">
      <div className="rw-segment-main">
        <UsuarioRolForm onSave={onSave} loading={loading} error={error} />
      </div>
    </div>
  )
}

export default NewUsuarioRol