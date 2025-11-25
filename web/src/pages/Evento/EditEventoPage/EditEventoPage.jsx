import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EditEventoCell from 'src/components/Evento/EditEventoCell'

const EditEventoPage = ({ id }) => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Eventos', link: routes.eventos() },
        { label: 'Editar' }
      ]}
    >
      <EditEventoCell id={id} />
    </ScaffoldLayout>
  )
}

export default EditEventoPage
