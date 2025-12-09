import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewParametro from 'src/components/Parametro/NewParametro'

const NewParametroPage = () => {
  return (
    <ScaffoldLayout
      title="Parámetros"
      titleTo="parametros"
      groupTitle="Configuración"
      breadcrumbItems={[
        { label: 'Nuevo Registro' }
      ]}
    >
      <NewParametro />
    </ScaffoldLayout>
  )
}

export default NewParametroPage
