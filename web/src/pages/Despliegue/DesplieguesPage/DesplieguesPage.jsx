import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import DesplieguesCell from 'src/components/Despliegue/DesplieguesCell'

const DesplieguesPage = () => {
  return (
    <ScaffoldLayout
      title="Despliegues"
      titleTo="despliegues"
      groupTitle="Despliegues"
      buttonLabel="Nuevo Despliegue"
      buttonTo="newDespliegue"
    >
      <DesplieguesCell />
    </ScaffoldLayout>
  )
}

export default DesplieguesPage
