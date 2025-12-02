import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewServidor from 'src/components/Servidor/NewServidor'

const NewServidorPage = () => {
  return (
    <ScaffoldLayout
      title="Servidores"
      titleTo="servidors"
      groupTitle="Infraestructura"
      breadcrumbItems={[
        { label: 'Nuevo Registro' }
      ]}
    >
      <NewServidor />
    </ScaffoldLayout>
  )
}

export default NewServidorPage
