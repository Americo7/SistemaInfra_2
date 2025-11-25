import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EditClusterNodoCell from 'src/components/ClusterNodo/EditClusterNodoCell'

const EditClusterNodoPage = ({ id }) => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Nodos', link: routes.clusterNodos() },
        { label: 'Editar' }
      ]}
    >
      <EditClusterNodoCell id={id} />
    </ScaffoldLayout>
  )
}

export default EditClusterNodoPage
