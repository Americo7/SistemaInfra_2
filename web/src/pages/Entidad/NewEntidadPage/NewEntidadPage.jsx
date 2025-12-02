import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewEntidad from 'src/components/Entidad/NewEntidad'

const NewEntidadPage = () => {
  return (
    <ScaffoldLayout
      title="Entidades"
      titleTo="entidads"
      groupTitle="Despliegues"
      breadcrumbItems={[
        { label: 'Nuevo Registro' }
      ]}
    >
      <NewEntidad />
    </ScaffoldLayout>
  )
}

export default NewEntidadPage
