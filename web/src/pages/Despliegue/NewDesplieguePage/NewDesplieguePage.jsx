import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewDespliegue from 'src/components/Despliegue/NewDespliegue'

const NewDesplieguePage = () => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Despliegues', link: routes.despliegues() },
        { label: 'Nuevo Despliegue' }
      ]}
    >
      <NewDespliegue />
    </ScaffoldLayout>
  )
}

export default NewDesplieguePage
