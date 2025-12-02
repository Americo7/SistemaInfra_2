import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import MaquinasCell from 'src/components/Maquina/MaquinasCell'

const MaquinasPage = () => {
  return (
    <ScaffoldLayout
      title="Máquinas"
      titleTo="maquinas"
      groupTitle="Infraestructura"
      buttonLabel="Nueva Maquina"
      buttonTo="newMaquina"
    >
      <MaquinasCell />
    </ScaffoldLayout>
  )
}

export default MaquinasPage