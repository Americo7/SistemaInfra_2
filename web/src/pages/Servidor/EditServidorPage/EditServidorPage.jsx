import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EditServidorCell from 'src/components/Servidor/EditServidorCell'

const EditServidorPage = ({ id }) => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Servidores', link: routes.servidors() },
        { label: 'Editar' }
      ]}
    >
      <EditServidorCell id={id} />
    </ScaffoldLayout>
  )
}

export default EditServidorPage
