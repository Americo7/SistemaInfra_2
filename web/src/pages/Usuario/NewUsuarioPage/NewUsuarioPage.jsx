import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewUsuario from 'src/components/Usuario/NewUsuario'

const NewUsuarioPage = () => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Usuarios', link: routes.usuarios() },
        { label: 'Nuevo Usuario' }
      ]}
    >
      <NewUsuario />
    </ScaffoldLayout>
  )
}

export default NewUsuarioPage
