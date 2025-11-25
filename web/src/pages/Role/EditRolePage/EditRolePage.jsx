import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EditRoleCell from 'src/components/Role/EditRoleCell'

const EditRolePage = ({ id }) => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Roles', link: routes.roles() },
        { label: 'Editar' }
      ]}
    >
      <EditRoleCell id={id} />
    </ScaffoldLayout>
  )
}

export default EditRolePage
