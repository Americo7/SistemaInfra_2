import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EditDespliegueCell from 'src/components/Despliegue/EditDespliegueCell'

const EditDesplieguePage = ({ id }) => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Despliegues', link: routes.despliegues() },
        { label: 'Editar' }
      ]}
    >
      <EditDespliegueCell id={id} />
    </ScaffoldLayout>
  )
}

export default EditDesplieguePage
