import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EditRoleCell from 'src/components/Role/EditRoleCell'

const EditRolePage = ({ id }) => {
  return (
    <ScaffoldLayout
      title="Roles"
      titleTo="roles"
      groupTitle="Gestión de Usuarios"
      breadcrumbItems={[
        { label: 'Editar' }
      ]}
    >
      <EditRoleCell id={id} />
    </ScaffoldLayout>
  )
}

export default EditRolePage
