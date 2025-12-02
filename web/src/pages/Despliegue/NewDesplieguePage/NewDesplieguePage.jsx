import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewDespliegue from 'src/components/Despliegue/NewDespliegue'

const NewDesplieguePage = () => {
  return (
    <ScaffoldLayout
      title="Despliegues"
      titleTo="despliegues"
      groupTitle="Despliegues"
      breadcrumbItems={[
        { label: 'Nuevo Registro' }
      ]}
    >
      <NewDespliegue />
    </ScaffoldLayout>
  )
}

export default NewDesplieguePage
