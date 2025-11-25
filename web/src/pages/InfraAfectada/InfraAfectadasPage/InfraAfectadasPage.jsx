import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import InfraAfectadasCell from 'src/components/InfraAfectada/InfraAfectadasCell'

const InfraAfectadasPage = () => {
  return (
    <ScaffoldLayout
      title="Infraestructura Afectada"
      titleTo="infraAfectadas"
      buttonLabel="Nuevo Registro"
      buttonTo="newInfraAfectada"
    >
      <InfraAfectadasCell />
    </ScaffoldLayout>
  )
}

export default InfraAfectadasPage
