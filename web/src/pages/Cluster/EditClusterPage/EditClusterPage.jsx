import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EditClusterCell from 'src/components/Cluster/EditClusterCell'

const EditClusterPage = ({ id }) => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Clusters', link: routes.clusters() },
        { label: 'Editar' }
      ]}
    >
      <EditClusterCell id={id} />
    </ScaffoldLayout>
  )
}

export default EditClusterPage
