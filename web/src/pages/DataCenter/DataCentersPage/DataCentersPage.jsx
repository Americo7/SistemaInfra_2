import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import DataCentersCell from 'src/components/DataCenter/DataCentersCell'

const DataCentersPage = () => {
  return (
    <ScaffoldLayout
      title="Data Centers"
      titleTo="dataCenters"
      groupTitle="Infraestructura"
      buttonLabel="Nuevo Data Center"
      buttonTo="newDataCenter"
    >
      <DataCentersCell />
    </ScaffoldLayout>
  )
}

export default DataCentersPage
