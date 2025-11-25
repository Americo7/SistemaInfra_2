import { routes, navigate } from '@redwoodjs/router'
import { useQuery, useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import UsuarioRolCell from 'src/components/UsuarioRol/UsuarioRolCell'

const QUERY = gql`
  query UsuarioRol($id: Int!) {
    usuarioRol(id: $id) {
      id
      id_usuario
      id_rol
    }
  }
`

const DELETE_MUTATION = gql`
  mutation DeleteUsuarioRol($id: Int!) {
    deleteUsuarioRol(id: $id) {
      id
    }
  }
`

const UsuarioRolPage = ({ id }) => {
  const { data } = useQuery(QUERY, { variables: { id } })
  const titulo = data?.usuarioRol
    ? `Usuario #${data.usuarioRol.id_usuario} / Rol #${data.usuarioRol.id_rol}`
    : 'Cargando…'

  const [deleteUsuarioRol] = useMutation(DELETE_MUTATION, {
    onCompleted: () => {
      toast.success('UsuarioRol eliminado')
      navigate(routes.usuarioRols())
    },
    onError: (err) => toast.error(err?.message || 'Error al eliminar'),
  })

  const actionButtons = [
    {
      label: 'Editar',
      iconName: 'edit',
      variant: 'contained',
      onClick: () => navigate(routes.editUsuarioRol({ id })),
    },
    {
      label: 'Eliminar',
      iconName: 'delete',
      variant: 'outlined',
      color: 'error',
      onClick: () => {
        if (confirm('¿Eliminar este usuarioRol?')) {
          deleteUsuarioRol({ variables: { id } })
        }
      },
    },
  ]

  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Usuario Roles', link: routes.usuarioRols() },
        { label: titulo },
      ]}
      actionButtons={actionButtons}
    >
      <UsuarioRolCell id={id} />
    </ScaffoldLayout>
  )
}

export default UsuarioRolPage
