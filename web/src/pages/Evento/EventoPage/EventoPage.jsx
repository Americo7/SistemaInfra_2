import { routes, navigate } from '@redwoodjs/router'
import { useQuery, useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import EventoCell from 'src/components/Evento/EventoCell'

const QUERY = gql`
  query Evento($id: Int!) {
    evento(id: $id) {
      id
      descripcion
    }
  }
`

const DELETE_MUTATION = gql`
  mutation DeleteEvento($id: Int!) {
    deleteEvento(id: $id) {
      id
    }
  }
`

const EventoPage = ({ id }) => {
  const { data } = useQuery(QUERY, { variables: { id } })
  const descripcion = data?.evento?.descripcion || 'Cargando…'

  const [deleteEvento] = useMutation(DELETE_MUTATION, {
    onCompleted: () => {
      toast.success('Evento eliminado')
      navigate(routes.eventos())
    },
    onError: (err) => toast.error(err?.message || 'Error al eliminar'),
  })

  const actionButtons = [
    {
      label: 'Editar',
      iconName: 'edit',
      variant: 'contained',
      onClick: () => navigate(routes.editEvento({ id })),
    },
    {
      label: 'Eliminar',
      iconName: 'delete',
      variant: 'outlined',
      color: 'error',
      onClick: () => {
        if (confirm(`¿Eliminar el evento "${descripcion}"?`)) {
          deleteEvento({ variables: { id } })
        }
      },
    },
  ]

  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Eventos', link: routes.eventos() },
        { label: descripcion },
      ]}
      actionButtons={actionButtons}
    >
      <EventoCell id={id} />
    </ScaffoldLayout>
  )
}

export default EventoPage
