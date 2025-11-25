import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import ServidoresCell from 'src/components/Servidor/ServidorsCell'

const ServidoresPage = () => {
  return (
    <ScaffoldLayout
      title="Servidores"
      titleTo="servidores"
      buttonLabel="Nuevo Servidor"
      buttonTo="newServidor"
    >
      <ServidoresCell />
    </ScaffoldLayout>
  )
}

export default ServidoresPage
