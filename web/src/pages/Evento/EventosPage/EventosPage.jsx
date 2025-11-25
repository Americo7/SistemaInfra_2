import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EventosCell from 'src/components/Evento/EventosCell'

const EventosPage = () => {
  return (
    <ScaffoldLayout
      title="Eventos"
      titleTo="eventos"
      buttonLabel="Nuevo Evento"
      buttonTo="newEvento"
    >
      <EventosCell />
    </ScaffoldLayout>
  )
}

export default EventosPage
