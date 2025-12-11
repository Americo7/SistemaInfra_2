import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewUsuarioRol from 'src/components/UsuarioRol/NewUsuarioRol'

const NewUsuarioRolPage = () => {
  return (
    <ScaffoldLayout
      title="Asignacion de rol"
      titleTo="usuarioRols"
      groupTitle="Gestión de Usuarios"
      breadcrumbItems={[
        { label: 'Nuevo Registro' }
      ]}
    >
      <NewUsuarioRol />
    </ScaffoldLayout>
  )
}

export default NewUsuarioRolPage
