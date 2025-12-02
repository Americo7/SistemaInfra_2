import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewProxmoxEndpoint from 'src/components/ProxmoxEndpoint/NewProxmoxEndpoint'

const NewProxmoxEndpointPage = () => {
  return (
    <ScaffoldLayout
      title="Endpoints de Proxmox"
      titleTo="proxmoxEndpoints"
      groupTitle="Sincronización"
      breadcrumbItems={[
        { label: 'Nuevo Registro' }
      ]}
    >
      <NewProxmoxEndpoint />
    </ScaffoldLayout>
  )
}

export default NewProxmoxEndpointPage
