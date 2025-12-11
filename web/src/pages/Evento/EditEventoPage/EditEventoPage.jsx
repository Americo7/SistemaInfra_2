import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EditEventoCell from 'src/components/Evento/EditEventoCell'

const EditEventoPage = ({ id }) => {
  return (
    <ScaffoldLayout
      title="Eventos"
      titleTo="eventos"
      groupTitle="Eventos"
      breadcrumbItems={[
        { label: 'Editar' }
      ]}
    >
      <EditEventoCell id={id} />
    </ScaffoldLayout>
  )
}

export default EditEventoPage
