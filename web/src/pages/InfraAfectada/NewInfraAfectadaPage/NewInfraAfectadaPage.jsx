import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewInfraAfectada from 'src/components/InfraAfectada/NewInfraAfectada'

const NewInfraAfectadaPage = () => {
  return (
    <ScaffoldLayout
      title="Infraestructuras Afectadas"
      titleTo="infraAfectadas"
      groupTitle="Eventos"
      breadcrumbItems={[
        { label: 'Nuevo Registro' }
      ]}
    >
      <NewInfraAfectada />
    </ScaffoldLayout>
  )
}

export default NewInfraAfectadaPage
