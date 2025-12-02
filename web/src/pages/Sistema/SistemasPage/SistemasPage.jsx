import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import SistemasCell from 'src/components/Sistema/SistemasCell'

const SistemasPage = () => {
  return (
    <ScaffoldLayout
      title="Sistemas"
      titleTo="sistemas"
      groupTitle="Despliegues"
      buttonLabel="Nuevo Sistema"
      buttonTo="newSistema"
    >
      <SistemasCell />
    </ScaffoldLayout>
  )
}

export default SistemasPage