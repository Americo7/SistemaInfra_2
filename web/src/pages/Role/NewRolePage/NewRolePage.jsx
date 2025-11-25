import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewRole from 'src/components/Role/NewRole'

const NewRolePage = () => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Roles', link: routes.roles() },
        { label: 'Nuevo Rol' }
      ]}
    >
      <NewRole />
    </ScaffoldLayout>
  )
}

export default NewRolePage
