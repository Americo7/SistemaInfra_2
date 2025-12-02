import { routes, navigate } from '@redwoodjs/router'
import { useQuery, useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import UsuarioCell from 'src/components/Usuario/UsuarioCell'

const QUERY = gql`
  query Usuario($id: Int!) {
    usuario(id: $id) {
      id
      nombres
      primer_apellido
      segundo_apellido
    }
  }
`

const DELETE_MUTATION = gql`
  mutation DeleteUsuario($id: Int!) {
    deleteUsuario(id: $id) {
      id
    }
  }
`

const UsuarioPage = ({ id }) => {
  const { data } = useQuery(QUERY, { variables: { id } })
  const fullName =
    data?.usuario
      ? `${data.usuario.nombres} ${data.usuario.primer_apellido} ${data.usuario.segundo_apellido}`
      : 'Cargando…'

  const [deleteUsuario] = useMutation(DELETE_MUTATION, {
    onCompleted: () => {
      toast.success('Usuario eliminado')
      navigate(routes.usuarios())
    },
    onError: (err) => toast.error(err?.message || 'Error al eliminar'),
  })

  const actionButtons = [
    {
      label: 'Editar',
      iconName: 'edit',
      variant: 'contained',
      onClick: () => navigate(routes.editUsuario({ id })),
    },
    {
      label: 'Eliminar',
      iconName: 'delete',
      variant: 'outlined',
      color: 'error',
      onClick: () => {
        if (confirm(`¿Eliminar al usuario "${fullName}"?`)) {
          deleteUsuario({ variables: { id } })
        }
      },
    },
  ]

  return (
    <ScaffoldLayout
      title="Usuarios"
      titleTo="usuarios"
      groupTitle="Gestión de Usuarios"
      breadcrumbItems={[
        { label: 'Detalle' }
      ]}
      actionButtons={actionButtons}
    >
      <UsuarioCell id={id} />
    </ScaffoldLayout>
  )
}

export default UsuarioPage
