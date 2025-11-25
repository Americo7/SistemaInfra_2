import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EditK8sEndpointCell from 'src/components/K8sEndpoint/EditK8sEndpointCell'

const EditK8sEndpointPage = ({ id }) => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Kubernetes', link: routes.k8SEndpoints() },
        { label: 'Editar' }
      ]}
    >
      <EditK8sEndpointCell id={id} />
    </ScaffoldLayout>
  )
}

export default EditK8sEndpointPage
