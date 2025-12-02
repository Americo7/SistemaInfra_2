import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EntidadesCell from 'src/components/Entidad/EntidadsCell'

const EntidadsPage = () => {
  return (
    <ScaffoldLayout
      title="Entidades"
      titleTo="entidads"
      groupTitle="Despliegues"
      buttonLabel="Nueva Entidad"
      buttonTo="newEntidad"
    >
      <EntidadesCell />
    </ScaffoldLayout>
  )
}

export default EntidadsPage
