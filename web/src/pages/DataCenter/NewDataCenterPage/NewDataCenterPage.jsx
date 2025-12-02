import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewDataCenter from 'src/components/DataCenter/NewDataCenter'

const NewDataCenterPage = () => {
  return (
    <ScaffoldLayout
      title="Data Centers"
      titleTo="dataCenters"
      groupTitle="Infraestructura"
      breadcrumbItems={[
        { label: 'Nuevo Registro' }
      ]}
    >
      <NewDataCenter />
    </ScaffoldLayout>
  )
}

export default NewDataCenterPage
