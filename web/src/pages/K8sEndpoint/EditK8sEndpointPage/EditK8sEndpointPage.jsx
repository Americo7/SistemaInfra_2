import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EditK8sEndpointCell from 'src/components/K8sEndpoint/EditK8sEndpointCell'

const EditK8sEndpointPage = ({ id }) => {
  return (
    <ScaffoldLayout
      title="Endpoints de Kubernetes"
      titleTo="k8SEndpoints"
      groupTitle="Sincronización"
      breadcrumbItems={[
        { label: 'Editar' }
      ]}
    >
      <EditK8sEndpointCell id={id} />
    </ScaffoldLayout>
  )
}

export default EditK8sEndpointPage
