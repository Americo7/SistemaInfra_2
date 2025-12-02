import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import ServidoresCell from 'src/components/Servidor/ServidorsCell'

const ServidoresPage = () => {
  return (
    <ScaffoldLayout
      title="Servidores"
      titleTo="servidors"
      groupTitle="Infraestructura"
      buttonLabel="Nuevo Servidor"
      buttonTo="newServidor"
    >
      <ServidoresCell />
    </ScaffoldLayout>
  )
}

export default ServidoresPage
