import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import ClustersCell from 'src/components/Cluster/ClustersCell'

const ClustersPage = () => {
  return (
    <ScaffoldLayout
      title="Clusters"
      titleTo="clusters"
      buttonLabel="Nuevo Cluster"
      buttonTo="newCluster"
    >
      <ClustersCell />
    </ScaffoldLayout>
  )
}

export default ClustersPage
