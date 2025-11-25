import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewUsuarioRol from 'src/components/UsuarioRol/NewUsuarioRol'

const NewUsuarioRolPage = () => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Usuario Roles', link: routes.usuarioRols() },
        { label: 'Nuevo UsuarioRol' }
      ]}
    >
      <NewUsuarioRol />
    </ScaffoldLayout>
  )
}

export default NewUsuarioRolPage
