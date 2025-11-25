import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import RolesCell from 'src/components/Role/RolesCell'

const RolesPage = () => {
  return (
    <ScaffoldLayout
      title="Roles"
      titleTo="roles"
      buttonLabel="Nuevo Rol"
      buttonTo="newRole"
    >
      <RolesCell />
    </ScaffoldLayout>
  )
}

export default RolesPage
