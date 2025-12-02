import { routes, navigate } from '@redwoodjs/router'
import { useMutation, useQuery } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import ProxmoxEndpointCell from 'src/components/ProxmoxEndpoint/ProxmoxEndpointCell'
import { gql } from '@redwoodjs/web'

const QUERY = gql`
  query ProxmoxEndpoint($id: Int!) {
    proxmoxEndpoint(id: $id) {
      id
      nombre
    }
  }
`

const DELETE_MUTATION = gql`
  mutation DeleteProxmoxEndpoint($id: Int!) {
    deleteProxmoxEndpoint(id: $id) {
      id
    }
  }
`

const ProxmoxEndpointPage = ({ id }) => {
  const { data } = useQuery(QUERY, { variables: { id } })
  const nombre = data?.proxmoxEndpoint?.nombre || 'Cargando…'

  const [deleteItem] = useMutation(DELETE_MUTATION, {
    onCompleted: () => {
      toast.success('Endpoint eliminado')
      navigate(routes.proxmoxEndpoints())
    },
    onError: (e) => toast.error(e.message),
  })

  const actionButtons = [
    {
      label: 'Editar',
      iconName: 'edit',
      variant: 'contained',
      onClick: () => navigate(routes.editProxmoxEndpoint({ id })),
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
      title="Endpoints de Proxmox"
      titleTo="proxmoxEndpoints"
      groupTitle="Sincronización"
      breadcrumbItems={[
        { label: 'Detalle' }
      ]}
      actionButtons={actionButtons}
    >
      <ProxmoxEndpointCell id={id} />
    </ScaffoldLayout>
  )
}

export default ProxmoxEndpointPage
