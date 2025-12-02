import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewSistema from 'src/components/Sistema/NewSistema'

const NewSistemaPage = () => {
  return (
    <ScaffoldLayout
      title="Sistemas"
      titleTo="sistemas"
      groupTitle="Despliegues"
      breadcrumbItems={[
        { label: 'Nuevo Registro' }
      ]}
    >
      <NewSistema />
    </ScaffoldLayout>
  )
}

export default NewSistemaPage