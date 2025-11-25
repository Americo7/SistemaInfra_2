import { routes } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EditDataCenterCell from 'src/components/DataCenter/EditDataCenterCell'

const EditDataCenterPage = ({ id }) => {
  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Data Centers', link: routes.dataCenters() },
        { label: 'Editar' }
      ]}
    >
      <EditDataCenterCell id={id} />
    </ScaffoldLayout>
  )
}

export default EditDataCenterPage
