import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EntidadesCell from 'src/components/Entidad/EntidadsCell'

const EntidadsPage = () => {
  return (
    <ScaffoldLayout
      title="Entidades"
      titleTo="entidades"
      buttonLabel="Nueva Entidad"
      buttonTo="newEntidad"
    >
      <EntidadesCell />
    </ScaffoldLayout>
  )
}

export default EntidadsPage
