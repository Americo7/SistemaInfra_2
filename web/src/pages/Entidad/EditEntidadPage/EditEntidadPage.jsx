import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EditEntidadCell from 'src/components/Entidad/EditEntidadCell'

const EditEntidadPage = ({ id }) => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Entidades', link: routes.entidads() },
        { label: 'Editar' }
      ]}
    >
      <EditEntidadCell id={id} />
    </ScaffoldLayout>
  )
}

export default EditEntidadPage
