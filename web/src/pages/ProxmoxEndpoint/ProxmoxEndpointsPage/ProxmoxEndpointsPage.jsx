import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import ProxmoxEndpointsCell from 'src/components/ProxmoxEndpoint/ProxmoxEndpointsCell'

const ProxmoxEndpointsPage = () => {
  return (
    <ScaffoldLayout
      title="Endpoints Proxmox"
      titleTo="proxmoxEndpoints"
      buttonLabel="Nuevo Endpoint"
      buttonTo="newProxmoxEndpoint"
    >
      <ProxmoxEndpointsCell />
    </ScaffoldLayout>
  )
}

export default ProxmoxEndpointsPage
