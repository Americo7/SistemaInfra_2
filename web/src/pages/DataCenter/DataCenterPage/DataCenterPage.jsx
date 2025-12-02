import { routes, navigate } from '@redwoodjs/router'
import { useQuery, useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import DataCenterCell from 'src/components/DataCenter/DataCenterCell'

const QUERY = gql`
  query DataCenter($id: Int!) {
    dataCenter(id: $id) {
      id
      nombre
    }
  }
`

const DELETE_MUTATION = gql`
  mutation DeleteDataCenter($id: Int!) {
    deleteDataCenter(id: $id) {
      id
    }
  }
`

const DataCenterPage = ({ id }) => {
  const { data } = useQuery(QUERY, { variables: { id } })
  const nombreDataCenter = data?.dataCenter?.nombre || 'Cargando…'

  const [deleteDataCenter] = useMutation(DELETE_MUTATION, {
    onCompleted: () => {
      toast.success('Data Center eliminado')
      navigate(routes.dataCenters())
    },
    onError: (err) => toast.error(err?.message || 'Error al eliminar'),
  })

  const actionButtons = [
    {
      label: 'Editar',
      iconName: 'edit',
      variant: 'contained',
      onClick: () => navigate(routes.editDataCenter({ id })),
    },
    {
      label: 'Eliminar',
      iconName: 'delete',
      variant: 'outlined',
      color: 'error',
      onClick: () => {
        if (confirm(`¿Eliminar el Data Center "${nombreDataCenter}"?`)) {
          deleteDataCenter({ variables: { id } })
        }
      },
    },
  ]

  return (
    <ScaffoldLayout
      title="Data Centers"
      titleTo="dataCenters"
      groupTitle="Infraestructura"
      breadcrumbItems={[
        { label: 'Detalle' }
      ]}
      actionButtons={actionButtons}
    >
      <DataCenterCell id={id} />
    </ScaffoldLayout>
  )
}

export default DataCenterPage
