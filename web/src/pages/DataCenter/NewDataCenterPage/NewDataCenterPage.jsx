import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import NewDataCenter from 'src/components/DataCenter/NewDataCenter'

const NewDataCenterPage = () => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Data Centers', link: routes.dataCenters() },
        { label: 'Nuevo Data Center' }
      ]}
    >
      <NewDataCenter />
    </ScaffoldLayout>
  )
}

export default NewDataCenterPage
