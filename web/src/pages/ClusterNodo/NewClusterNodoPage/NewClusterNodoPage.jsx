import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewClusterNodo from 'src/components/ClusterNodo/NewClusterNodo'

const NewClusterNodoPage = () => {
  return (
    <ScaffoldLayout
      title="Nodos"
      titleTo="clusterNodos"
      groupTitle="Infraestructura"
      breadcrumbItems={[
        { label: 'Nuevo Registro' }
      ]}
    >
      <NewClusterNodo />
    </ScaffoldLayout>
  )
}

export default NewClusterNodoPage
