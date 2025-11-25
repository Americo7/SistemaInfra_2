import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EditSistemaCell from 'src/components/Sistema/EditSistemaCell'

const EditSistemaPage = ({ id }) => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Sistemas', link: routes.sistemas() },
        { label: 'Editar' }
      ]}
    >
      <EditSistemaCell id={id} />
    </ScaffoldLayout>
  )
}

export default EditSistemaPage
