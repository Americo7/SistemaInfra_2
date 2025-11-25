import { routes, navigate } from '@redwoodjs/router'
import { useQuery, useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import ClusterCell from 'src/components/Cluster/ClusterCell'

const QUERY = gql`
  query Cluster($id: Int!) {
    cluster(id: $id) {
      id
      nombre
    }
  }
`

const DELETE_MUTATION = gql`
  mutation DeleteCluster($id: Int!) {
    deleteCluster(id: $id) {
      id
    }
  }
`

const ClusterPage = ({ id }) => {
  const { data } = useQuery(QUERY, { variables: { id } })
  const nombreCluster = data?.cluster?.nombre || 'Cargando…'

  const [deleteCluster] = useMutation(DELETE_MUTATION, {
    onCompleted: () => {
      toast.success('Cluster eliminado')
      navigate(routes.clusters())
    },
    onError: (err) => toast.error(err?.message || 'Error al eliminar'),
  })

  const actionButtons = [
    {
      label: 'Editar',
      iconName: 'edit',
      variant: 'contained',
      onClick: () => navigate(routes.editCluster({ id })),
    },
    {
      label: 'Eliminar',
      iconName: 'delete',
      variant: 'outlined',
      color: 'error',
      onClick: () => {
        if (confirm(`¿Eliminar el cluster "${nombreCluster}"?`)) {
          deleteCluster({ variables: { id } })
        }
      },
    },
  ]

  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Clusters', link: routes.clusters() },
        { label: nombreCluster },
      ]}
      actionButtons={actionButtons}
    >
      <ClusterCell id={id} />
    </ScaffoldLayout>
  )
}

export default ClusterPage
