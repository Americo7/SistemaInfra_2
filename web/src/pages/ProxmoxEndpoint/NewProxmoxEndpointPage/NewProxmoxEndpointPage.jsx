import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewProxmoxEndpoint from 'src/components/ProxmoxEndpoint/NewProxmoxEndpoint'

const NewProxmoxEndpointPage = () => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Proxmox', link: routes.proxmoxEndpoints() },
        { label: 'Nuevo Endpoint' }
      ]}
    >
      <NewProxmoxEndpoint />
    </ScaffoldLayout>
  )
}

export default NewProxmoxEndpointPage
