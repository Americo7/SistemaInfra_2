import { routes, navigate } from '@redwoodjs/router'
import { useQuery, useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import ComponenteCell from 'src/components/Componente/ComponenteCell'

const QUERY = gql`
  query Componente($id: Int!) {
    componente(id: $id) {
      id
      nombre
    }
  }
`

const DELETE_MUTATION = gql`
  mutation DeleteComponente($id: Int!) {
    deleteComponente(id: $id) {
      id
    }
  }
`

const ComponentePage = ({ id }) => {
  const { data } = useQuery(QUERY, { variables: { id } })
  const nombreComponente = data?.componente?.nombre || 'Cargando…'

  const [deleteComponente] = useMutation(DELETE_MUTATION, {
    onCompleted: () => {
      toast.success('Componente eliminado')
      navigate(routes.componentes())
    },
    onError: (err) => toast.error(err?.message || 'Error al eliminar'),
  })

  const actionButtons = [
    {
      label: 'Editar',
      iconName: 'edit',
      variant: 'contained',
      onClick: () => navigate(routes.editComponente({ id })),
    },
    {
      label: 'Eliminar',
      iconName: 'delete',
      variant: 'outlined',
      color: 'error',
      onClick: () => {
        if (confirm(`¿Eliminar el componente "${nombreComponente}"?`)) {
          deleteComponente({ variables: { id } })
        }
      },
    },
  ]

  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Componentes', link: routes.componentes() },
        { label: nombreComponente },
      ]}
      actionButtons={actionButtons}
    >
      <ComponenteCell id={id} />
    </ScaffoldLayout>
  )
}

export default ComponentePage
