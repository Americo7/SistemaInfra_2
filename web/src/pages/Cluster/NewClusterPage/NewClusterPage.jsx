import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewCluster from 'src/components/Cluster/NewCluster'

const NewClusterPage = () => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Clusters', link: routes.clusters() },
        { label: 'Nuevo Cluster' }
      ]}
    >
      <NewCluster />
    </ScaffoldLayout>
  )
}

export default NewClusterPage
