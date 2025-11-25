import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import UsuarioRolesCell from 'src/components/UsuarioRol/UsuarioRolsCell'

const UsuarioRolsPage = () => {
  return (
    <ScaffoldLayout
      title="Usuario Roles"
      titleTo="usuarioRoles"
      buttonLabel="Nuevo UsuarioRol"
      buttonTo="newUsuarioRol"
    >
      <UsuarioRolesCell />
    </ScaffoldLayout>
  )
}

export default UsuarioRolsPage
