import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EditSistemaCell from 'src/components/Sistema/EditSistemaCell'

const EditSistemaPage = ({ id }) => {
  return (
    <ScaffoldLayout
      title="Sistemas"
      titleTo="sistemas"
      groupTitle="Despliegues"
      breadcrumbItems={[
        { label: 'Editar' }
      ]}
    >
      <EditSistemaCell id={id} />
    </ScaffoldLayout>
  )
}

export default EditSistemaPage