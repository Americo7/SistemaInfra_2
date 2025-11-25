import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewServidor from 'src/components/Servidor/NewServidor'

const NewServidorPage = () => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Servidores', link: routes.servidors() },
        { label: 'Nuevo Servidor' }
      ]}
    >
      <NewServidor />
    </ScaffoldLayout>
  )
}

export default NewServidorPage
