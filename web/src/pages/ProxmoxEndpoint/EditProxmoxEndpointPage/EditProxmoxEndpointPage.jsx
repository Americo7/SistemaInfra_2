import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EditProxmoxEndpointCell from 'src/components/ProxmoxEndpoint/EditProxmoxEndpointCell'

const EditProxmoxEndpointPage = ({ id }) => {
  return (
    <ScaffoldLayout
      title="Endpoints de Proxmox"
      titleTo="proxmoxEndpoints"
      groupTitle="Sincronización"
      breadcrumbItems={[
        { label: 'Editar' }
      ]}
    >
      <EditProxmoxEndpointCell id={id} />
    </ScaffoldLayout>
  )
}

export default EditProxmoxEndpointPage
