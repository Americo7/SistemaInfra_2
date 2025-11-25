import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewClusterNodo from 'src/components/ClusterNodo/NewClusterNodo'

const NewClusterNodoPage = () => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Nodos', link: routes.clusterNodos() },
        { label: 'Nuevo Nodo' }
      ]}
    >
      <NewClusterNodo />
    </ScaffoldLayout>
  )
}

export default NewClusterNodoPage
