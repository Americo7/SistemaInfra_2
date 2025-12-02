import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import ProxmoxEndpointsCell from 'src/components/ProxmoxEndpoint/ProxmoxEndpointsCell'

const ProxmoxEndpointsPage = () => {
  return (
    <ScaffoldLayout
      title="Endpoints de Proxmox"
      titleTo="proxmoxEndpoints"
      groupTitle="Sincronización"
      buttonLabel="Nuevo Endpoint"
      buttonTo="newProxmoxEndpoint"
    >
      <ProxmoxEndpointsCell />
    </ScaffoldLayout>
  )
}

export default ProxmoxEndpointsPage
