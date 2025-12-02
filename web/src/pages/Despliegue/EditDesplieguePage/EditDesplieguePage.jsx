import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EditDespliegueCell from 'src/components/Despliegue/EditDespliegueCell'

const EditDesplieguePage = ({ id }) => {
  return (
    <ScaffoldLayout
      title="Despliegues"
      titleTo="despliegues"
      groupTitle="Despliegues"
      breadcrumbItems={[
        { label: 'Editar' }
      ]}
    >
      <EditDespliegueCell id={id} />
    </ScaffoldLayout>
  )
}

export default EditDesplieguePage
