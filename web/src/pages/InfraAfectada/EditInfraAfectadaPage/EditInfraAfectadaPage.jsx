import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EditInfraAfectadaCell from 'src/components/InfraAfectada/EditInfraAfectadaCell'

const EditInfraAfectadaPage = ({ id }) => {
  return (
    <ScaffoldLayout
      title="Infraestructuras Afectadas"
      titleTo="infraAfectadas"
      groupTitle="Eventos"
      breadcrumbItems={[
        { label: 'Editar' }
      ]}
    >
      <EditInfraAfectadaCell id={id} />
    </ScaffoldLayout>
  )
}

export default EditInfraAfectadaPage
