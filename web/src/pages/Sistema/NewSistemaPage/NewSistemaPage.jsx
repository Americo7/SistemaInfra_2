import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewSistema from 'src/components/Sistema/NewSistema'

const NewSistemaPage = () => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Despligues' },
        { label: 'Sistemas', link: routes.sistemas() },
      ]}
    >
      <NewSistema />
    </ScaffoldLayout>
  )
}

export default NewSistemaPage
