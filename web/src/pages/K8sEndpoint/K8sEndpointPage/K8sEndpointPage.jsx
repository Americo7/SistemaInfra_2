import { routes, navigate } from '@redwoodjs/router'
import { useQuery, useMutation } from '@redwoodjs/web'
import { gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import K8sEndpointCell from 'src/components/K8sEndpoint/K8sEndpointCell'

const QUERY = gql`
  query K8sEndpoint($id: Int!) {
    k8SEndpoint(id: $id) {
      id
      nombre
    }
  }
`

const DELETE_MUTATION = gql`
  mutation DeleteK8sEndpoint($id: Int!) {
    deleteK8sEndpoint(id: $id) {
      id
    }
  }
`

const K8sEndpointPage = ({ id }) => {
  const { data } = useQuery(QUERY, { variables: { id } })
  const nombre = data?.k8SEndpoint?.nombre || 'Cargando…'

  const [deleteItem] = useMutation(DELETE_MUTATION, {
    onCompleted: () => {
      toast.success('Endpoint eliminado')
      navigate(routes.k8SEndpoints())
    },
    onError: (e) => toast.error(e.message),
  })

  const actionButtons = [
    {
      label: 'Editar',
      iconName: 'edit',
      variant: 'contained',
      onClick: () => navigate(routes.editK8sEndpoint({ id })),
    },
    {
      label: 'Eliminar',
      iconName: 'delete',
      variant: 'outlined',
      color: 'error',
      onClick: () => {
        if (confirm(`Eliminar endpoint "${nombre}"?`)) {
          deleteItem({ variables: { id } })
        }
      },
    },
  ]

  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Kubernetes', link: routes.k8SEndpoints() },
        { label: nombre },
      ]}
      actionButtons={actionButtons}
    >
      <K8sEndpointCell id={id} />
    </ScaffoldLayout>
  )
}

export default K8sEndpointPage
