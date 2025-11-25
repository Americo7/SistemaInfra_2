import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EditUsuarioRolCell from 'src/components/UsuarioRol/EditUsuarioRolCell'

const EditUsuarioRolPage = ({ id }) => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Usuario Roles', link: routes.usuarioRols() },
        { label: 'Editar' }
      ]}
    >
      <EditUsuarioRolCell id={id} />
    </ScaffoldLayout>
  )
}

export default EditUsuarioRolPage
