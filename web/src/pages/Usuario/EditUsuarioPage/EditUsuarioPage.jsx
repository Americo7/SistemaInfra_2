import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EditUsuarioCell from 'src/components/Usuario/EditUsuarioCell'

const EditUsuarioPage = ({ id }) => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Usuarios', link: routes.usuarios() },
        { label: 'Editar' }
      ]}
    >
      <EditUsuarioCell id={id} />
    </ScaffoldLayout>
  )
}

export default EditUsuarioPage
