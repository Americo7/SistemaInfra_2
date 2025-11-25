import { routes, navigate } from '@redwoodjs/router'
import { useQuery, useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import InfraAfectadaCell from 'src/components/InfraAfectada/InfraAfectadaCell'

const QUERY = gql`
  query InfraAfectada($id: Int!) {
    infraAfectada(id: $id) {
      id
      id_evento
    }
  }
`

const DELETE_MUTATION = gql`
  mutation DeleteInfraAfectada($id: Int!) {
    deleteInfraAfectada(id: $id) {
      id
    }
  }
`

const InfraAfectadaPage = ({ id }) => {
  const { data } = useQuery(QUERY, { variables: { id } })
  const titulo = data?.infraAfectada?.id_evento
    ? `Evento #${data.infraAfectada.id_evento}`
    : 'Cargando…'

  const [deleteItem] = useMutation(DELETE_MUTATION, {
    onCompleted: () => {
      toast.success('Registro eliminado')
      navigate(routes.infraAfectadas())
    },
    onError: (err) => toast.error(err?.message || 'Error al eliminar'),
  })

  const actionButtons = [
    {
      label: 'Editar',
      iconName: 'edit',
      variant: 'contained',
      onClick: () => navigate(routes.editInfraAfectada({ id })),
    },
    {
      label: 'Eliminar',
      iconName: 'delete',
      variant: 'outlined',
      color: 'error',
      onClick: () => {
        if (confirm(`¿Eliminar este registro?`)) {
          deleteItem({ variables: { id } })
        }
      },
    },
  ]

  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Infraestructura Afectada', link: routes.infraAfectadas() },
        { label: titulo },
      ]}
      actionButtons={actionButtons}
    >
      <InfraAfectadaCell id={id} />
    </ScaffoldLayout>
  )
}

export default InfraAfectadaPage
