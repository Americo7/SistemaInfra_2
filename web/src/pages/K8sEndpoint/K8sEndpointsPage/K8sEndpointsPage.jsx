import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import K8sEndpointsCell from 'src/components/K8sEndpoint/K8sEndpointsCell'

const K8sEndpointsPage = () => {
  return (
    <ScaffoldLayout
      title="Endpoints de Kubernetes"
      titleTo="k8SEndpoints"
      groupTitle="Sincronización"
      buttonLabel="Nuevo Endpoint"
      buttonTo="newK8sEndpoint"
    >
      <K8sEndpointsCell />
    </ScaffoldLayout>
  )
}

export default K8sEndpointsPage
