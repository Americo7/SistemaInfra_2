import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewEvento from 'src/components/Evento/NewEvento'

const NewEventoPage = () => {
  return (
    <ScaffoldLayout
      title="Eventos"
      titleTo="eventos"
      groupTitle="Eventos"
      breadcrumbItems={[
        { label: 'Nuevo Registro' }
      ]}
    >
      <NewEvento />
    </ScaffoldLayout>
  )
}

export default NewEventoPage
