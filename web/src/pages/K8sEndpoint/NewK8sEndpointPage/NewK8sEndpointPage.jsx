import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewK8sEndpoint from 'src/components/K8sEndpoint/NewK8sEndpoint'

const NewK8sEndpointPage = () => {
  return (
    <ScaffoldLayout
      title="Endpoints de Kubernetes"
      titleTo="k8SEndpoints"
      groupTitle="Sincronización"
      breadcrumbItems={[
        { label: 'Nuevo Registro' }
      ]}
    >
      <NewK8sEndpoint />
    </ScaffoldLayout>
  )
}

export default NewK8sEndpointPage
