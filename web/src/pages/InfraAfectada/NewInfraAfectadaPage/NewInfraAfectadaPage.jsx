import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewInfraAfectada from 'src/components/InfraAfectada/NewInfraAfectada'

const NewInfraAfectadaPage = () => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Infraestructura Afectada', link: routes.infraAfectadas() },
        { label: 'Nuevo Registro' }
      ]}
    >
      <NewInfraAfectada />
    </ScaffoldLayout>
  )
}

export default NewInfraAfectadaPage
