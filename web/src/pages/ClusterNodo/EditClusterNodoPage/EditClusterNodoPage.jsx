import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EditClusterNodoCell from 'src/components/ClusterNodo/EditClusterNodoCell'

const EditClusterNodoPage = ({ id }) => {
  return (
    <ScaffoldLayout
      title="Nodos"
      titleTo="clusterNodos"
      groupTitle="Infraestructura"
      breadcrumbItems={[
        { label: 'Editar' }
      ]}
    >
      <EditClusterNodoCell id={id} />
    </ScaffoldLayout>
  )
}

export default EditClusterNodoPage
