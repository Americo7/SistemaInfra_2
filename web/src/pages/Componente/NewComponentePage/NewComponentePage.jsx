import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewComponente from 'src/components/Componente/NewComponente'

const NewComponentePage = () => {
  return (
    <ScaffoldLayout
      title="Componentes"
      titleTo="componentes"
      groupTitle="Despliegues"
      breadcrumbItems={[
        { label: 'Nuevo Registro' }
      ]}
    >
      <NewComponente />
    </ScaffoldLayout>
  )
}

export default NewComponentePage
