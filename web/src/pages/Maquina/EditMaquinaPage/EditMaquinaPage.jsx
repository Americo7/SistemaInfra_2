import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EditMaquinaCell from 'src/components/Maquina/EditMaquinaCell'

const EditMaquinaPage = ({ id }) => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Maquinas', link: routes.maquinas() },
        { label: 'Editar' }
      ]}
    >
      <EditMaquinaCell id={id} />
    </ScaffoldLayout>
  )
}

export default EditMaquinaPage