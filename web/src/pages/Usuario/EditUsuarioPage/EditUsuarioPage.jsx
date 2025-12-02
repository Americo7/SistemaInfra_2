import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EditUsuarioCell from 'src/components/Usuario/EditUsuarioCell'

const EditUsuarioPage = ({ id }) => {
  return (
    <ScaffoldLayout
      title="Usuarios"
      titleTo="usuarios"
      groupTitle="Gestión de Usuarios"
      breadcrumbItems={[
        { label: 'Editar' }
      ]}
    >
      <EditUsuarioCell id={id} />
    </ScaffoldLayout>
  )
}

export default EditUsuarioPage
