import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EditComponenteCell from 'src/components/Componente/EditComponenteCell'

const EditComponentePage = ({ id }) => {
  return (
    <ScaffoldLayout
      title="Componentes"
      titleTo="componentes"
      groupTitle="Despliegues"
      breadcrumbItems={[
        { label: 'Editar' }
      ]}
    >
      <EditComponenteCell id={id} />
    </ScaffoldLayout>
  )
}

export default EditComponentePage
