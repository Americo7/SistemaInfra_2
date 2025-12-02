import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewRole from 'src/components/Role/NewRole'

const NewRolePage = () => {
  return (
    <ScaffoldLayout
      title="Roles"
      titleTo="roles"
      groupTitle="Gestión de Usuarios"
      breadcrumbItems={[
        { label: 'Nuevo Registro' }
      ]}
    >
      <NewRole />
    </ScaffoldLayout>
  )
}

export default NewRolePage
