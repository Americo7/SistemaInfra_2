import { routes, navigate } from '@redwoodjs/router'
import { useQuery, useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import ClusterNodoCell from 'src/components/ClusterNodo/ClusterNodoCell'

const QUERY = gql`
  query ClusterNodo($id: Int!) {
    clusterNodo(id: $id) {
      id
      nombre
      nodoTipo
    }
  }
`

const DELETE_MUTATION = gql`
  mutation DeleteClusterNodo($id: Int!) {
    deleteClusterNodo(id: $id) {
      id
    }
  }
`

const ClusterNodoPage = ({ id }) => {
  const { data } = useQuery(QUERY, { variables: { id } })

  const titulo = data?.clusterNodo
    ? `${data.clusterNodo.nombre} (${data.clusterNodo.nodoTipo})`
    : 'Cargando…'

  const [deleteNodo] = useMutation(DELETE_MUTATION, {
    onCompleted: () => {
      toast.success('Nodo eliminado')
      navigate(routes.clusterNodos())
    },
    onError: (err) => toast.error(err?.message || 'Error al eliminar'),
  })

  const actionButtons = [
    {
      label: 'Editar',
      iconName: 'edit',
      variant: 'contained',
      onClick: () => navigate(routes.editClusterNodo({ id })),
    },
    {
      label: 'Eliminar',
      iconName: 'delete',
      variant: 'outlined',
      color: 'error',
      onClick: () => {
        if (confirm(`¿Eliminar el nodo "${titulo}"?`)) {
          deleteNodo({ variables: { id } })
        }
      },
    },
  ]

  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Nodos', link: routes.clusterNodos() },
        { label: titulo },
      ]}
      actionButtons={actionButtons}
    >
      <ClusterNodoCell id={id} />
    </ScaffoldLayout>
  )
}

export default ClusterNodoPage
