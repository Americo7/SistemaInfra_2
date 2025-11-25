import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EditInfraAfectadaCell from 'src/components/InfraAfectada/EditInfraAfectadaCell'

const EditInfraAfectadaPage = ({ id }) => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Infraestructura Afectada', link: routes.infraAfectadas() },
        { label: 'Editar' }
      ]}
    >
      <EditInfraAfectadaCell id={id} />
    </ScaffoldLayout>
  )
}

export default EditInfraAfectadaPage
