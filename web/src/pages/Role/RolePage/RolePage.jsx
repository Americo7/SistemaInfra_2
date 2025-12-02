import { routes, navigate } from '@redwoodjs/router'
import { useQuery, useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import RoleCell from 'src/components/Role/RoleCell'

const QUERY = gql`
  query Role($id: Int!) {
    role(id: $id) {
      id
      nombre
    }
  }
`

const DELETE_MUTATION = gql`
  mutation DeleteRole($id: Int!) {
    deleteRole(id: $id) {
      id
    }
  }
`

const RolePage = ({ id }) => {
  const { data } = useQuery(QUERY, { variables: { id } })
  const nombreRole = data?.role?.nombre || 'Cargando…'

  const [deleteRole] = useMutation(DELETE_MUTATION, {
    onCompleted: () => {
      toast.success('Rol eliminado')
      navigate(routes.roles())
    },
    onError: (err) => toast.error(err?.message || 'Error al eliminar'),
  })

  const actionButtons = [
    {
      label: 'Editar',
      iconName: 'edit',
      variant: 'contained',
      onClick: () => navigate(routes.editRole({ id })),
    },
    {
      label: 'Eliminar',
      iconName: 'delete',
      variant: 'outlined',
      color: 'error',
      onClick: () => {
        if (confirm(`¿Eliminar el rol "${nombreRole}"?`)) {
          deleteRole({ variables: { id } })
        }
      },
    },
  ]

  return (
    <ScaffoldLayout
      title="Roles"
      titleTo="roles"
      groupTitle="Gestión de Usuarios"
      breadcrumbItems={[
        { label: 'Detalle' }
      ]}
      actionButtons={actionButtons}
    >
      <RoleCell id={id} />
    </ScaffoldLayout>
  )
}

export default RolePage
