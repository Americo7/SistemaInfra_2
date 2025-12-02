import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EditServidorCell from 'src/components/Servidor/EditServidorCell'

const EditServidorPage = ({ id }) => {
  return (
    <ScaffoldLayout
      title="Servidores"
      titleTo="servidors"
      groupTitle="Infraestructura"
      breadcrumbItems={[
        { label: 'Editar' }
      ]}
    >
      <EditServidorCell id={id} />
    </ScaffoldLayout>
  )
}

export default EditServidorPage
