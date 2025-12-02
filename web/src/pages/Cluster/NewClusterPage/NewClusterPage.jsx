import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewCluster from 'src/components/Cluster/NewCluster'

const NewClusterPage = () => {
  return (
    <ScaffoldLayout
      title="Clusters"
      titleTo="clusters"
      groupTitle="Infraestructura"
      breadcrumbItems={[
        { label: 'Nuevo Registro' } // Nivel 4
      ]}
    >
      <NewCluster />
    </ScaffoldLayout>
  )
}

export default NewClusterPage