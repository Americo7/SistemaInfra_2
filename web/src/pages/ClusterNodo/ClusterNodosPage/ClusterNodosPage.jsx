import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import ClusterNodosCell from 'src/components/ClusterNodo/ClusterNodosCell'

const ClusterNodosPage = () => {
  return (
    <ScaffoldLayout
      title="Nodos"
      titleTo="Nodos"
      buttonLabel="Nuevo Nodo"
      buttonTo="newClusterNodo"
    >
      <ClusterNodosCell />
    </ScaffoldLayout>
  )
}

export default ClusterNodosPage
