import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewEvento from 'src/components/Evento/NewEvento'

const NewEventoPage = () => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Eventos', link: routes.eventos() },
        { label: 'Nuevo Evento' }
      ]}
    >
      <NewEvento />
    </ScaffoldLayout>
  )
}

export default NewEventoPage
