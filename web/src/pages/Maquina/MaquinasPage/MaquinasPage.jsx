import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import MaquinasCell from 'src/components/Maquina/MaquinasCell'

const MaquinasPage = () => {
  return (
    <ScaffoldLayout
      title="Maquinas"
      titleTo="maquinas"
      buttonLabel="Nueva Maquina"
      buttonTo="newMaquina"
    >
      <MaquinasCell />
    </ScaffoldLayout>
  )
}

export default MaquinasPage