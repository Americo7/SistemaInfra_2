import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewK8sEndpoint from 'src/components/K8sEndpoint/NewK8sEndpoint'

const NewK8sEndpointPage = () => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Kubernetes', link: routes.k8SEndpoints() },
        { label: 'Nuevo Endpoint' }
      ]}
    >
      <NewK8sEndpoint />
    </ScaffoldLayout>
  )
}

export default NewK8sEndpointPage
