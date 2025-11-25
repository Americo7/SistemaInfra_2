import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import UsuariosCell from 'src/components/Usuario/UsuariosCell'

const UsuariosPage = () => {
  return (
    <ScaffoldLayout
      title="Usuarios"
      titleTo="usuarios"
      buttonLabel="Nuevo Usuario"
      buttonTo="newUsuario"
    >
      <UsuariosCell />
    </ScaffoldLayout>
  )
}

export default UsuariosPage
