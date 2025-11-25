import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewEntidad from 'src/components/Entidad/NewEntidad'

const NewEntidadPage = () => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Entidades', link: routes.entidads() },
        { label: 'Nueva Entidad' }
      ]}
    >
      <NewEntidad />
    </ScaffoldLayout>
  )
}

export default NewEntidadPage
