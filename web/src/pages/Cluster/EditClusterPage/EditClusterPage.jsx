import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EditClusterCell from 'src/components/Cluster/EditClusterCell'

const EditClusterPage = ({ id }) => {
  return (
    <ScaffoldLayout
      title="Clusters"
      titleTo="clusters"
      groupTitle="Infraestructura"
      breadcrumbItems={[
        { label: 'Editar' }
      ]}
    >
      <EditClusterCell id={id} />
    </ScaffoldLayout>
  )
}

export default EditClusterPage