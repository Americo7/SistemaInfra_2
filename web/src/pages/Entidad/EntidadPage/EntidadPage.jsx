import { routes, navigate } from '@redwoodjs/router'
import { useQuery, useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EntidadCell from 'src/components/Entidad/EntidadCell'

const QUERY = gql`
  query Entidad($id: Int!) {
    entidad(id: $id) {
      id
      nombre
    }
  }
`

const DELETE_MUTATION = gql`
  mutation DeleteEntidad($id: Int!) {
    deleteEntidad(id: $id) {
      id
    }
  }
`

const EntidadPage = ({ id }) => {
  const { data } = useQuery(QUERY, { variables: { id } })
  const nombreEntidad = data?.entidad?.nombre || 'Cargando…'

  const [deleteEntidad] = useMutation(DELETE_MUTATION, {
    onCompleted: () => {
      toast.success('Entidad eliminada')
      navigate(routes.entidads())
    },
    onError: (err) => toast.error(err?.message || 'Error al eliminar'),
  })

  const actionButtons = [
    {
      label: 'Editar',
      iconName: 'edit',
      variant: 'contained',
      onClick: () => navigate(routes.editEntidad({ id })),
    },
    {
      label: 'Eliminar',
      iconName: 'delete',
      variant: 'outlined',
      color: 'error',
      onClick: () => {
        if (confirm(`¿Eliminar la entidad "${nombreEntidad}"?`)) {
          deleteEntidad({ variables: { id } })
        }
      },
    },
  ]

  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Entidades', link: routes.entidads() },
        { label: nombreEntidad },
      ]}
      actionButtons={actionButtons}
    >
      <EntidadCell id={id} />
    </ScaffoldLayout>
  )
}

export default EntidadPage
