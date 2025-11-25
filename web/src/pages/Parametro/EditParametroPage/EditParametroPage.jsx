import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EditParametroCell from 'src/components/Parametro/EditParametroCell'

const EditParametroPage = ({ id }) => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Parámetros', link: routes.parametros() },
        { label: 'Editar' }
      ]}
    >
      <EditParametroCell id={id} />
    </ScaffoldLayout>
  )
}

export default EditParametroPage
