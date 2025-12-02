import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewUsuario from 'src/components/Usuario/NewUsuario'

const NewUsuarioPage = () => {
  return (
    <ScaffoldLayout
      title="Usuarios"
      titleTo="usuarios"
      groupTitle="Gestión de Usuarios"
      breadcrumbItems={[
        { label: 'Nuevo Registro' }
      ]}
    >
      <NewUsuario />
    </ScaffoldLayout>
  )
}

export default NewUsuarioPage
