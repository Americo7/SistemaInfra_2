import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewComponente from 'src/components/Componente/NewComponente'

const NewComponentePage = () => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Componentes', link: routes.componentes() },
        { label: 'Nuevo Componente' },
      ]}
    >
      <NewComponente />
    </ScaffoldLayout>
  )
}

export default NewComponentePage
