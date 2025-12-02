import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EditEntidadCell from 'src/components/Entidad/EditEntidadCell'

const EditEntidadPage = ({ id }) => {
  return (
    <ScaffoldLayout
      title="Entidades"
      titleTo="entidads"
      groupTitle="Despliegues"
      breadcrumbItems={[
        { label: 'Editar' }
      ]}
    >
      <EditEntidadCell id={id} />
    </ScaffoldLayout>
  )
}

export default EditEntidadPage
