import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import RolesCell from 'src/components/Role/RolesCell'

const RolesPage = () => {
  return (
    <ScaffoldLayout
      title="Roles"
      titleTo="roles"
      groupTitle="Gestión de Usuarios"
      buttonLabel="Nuevo Rol"
      buttonTo="newRole"
    >
      <RolesCell />
    </ScaffoldLayout>
  )
}

export default RolesPage
