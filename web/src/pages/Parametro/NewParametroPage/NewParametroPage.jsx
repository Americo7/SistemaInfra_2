import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewParametro from 'src/components/Parametro/NewParametro'

const NewParametroPage = () => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Parámetros', link: routes.parametros() },
        { label: 'Nuevo Parámetro' }
      ]}
    >
      <NewParametro />
    </ScaffoldLayout>
  )
}

export default NewParametroPage
