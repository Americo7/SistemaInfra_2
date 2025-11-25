import { routes, navigate } from '@redwoodjs/router'
import { useQuery, useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import ServidorCell from 'src/components/Servidor/ServidorCell'

const QUERY = gql`
  query Servidor($id: Int!) {
    servidor(id: $id) {
      id
      nombre
    }
  }
`

const DELETE_MUTATION = gql`
  mutation DeleteServidor($id: Int!) {
    deleteServidor(id: $id) {
      id
    }
  }
`

const ServidorPage = ({ id }) => {
  const { data } = useQuery(QUERY, { variables: { id } })
  const nombreServidor = data?.servidor?.nombre || 'Cargando…'

  const [deleteServidor] = useMutation(DELETE_MUTATION, {
    onCompleted: () => {
      toast.success('Servidor eliminado')
      navigate(routes.servidors())
    },
    onError: (err) => toast.error(err?.message || 'Error al eliminar'),
  })

  const actionButtons = [
    {
      label: 'Editar',
      iconName: 'edit',
      variant: 'contained',
      onClick: () => navigate(routes.editServidor({ id })),
    },
    {
      label: 'Eliminar',
      iconName: 'delete',
      variant: 'outlined',
      color: 'error',
      onClick: () => {
        if (confirm(`¿Eliminar el servidor "${nombreServidor}"?`)) {
          deleteServidor({ variables: { id } })
        }
      },
    },
  ]

  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Servidores', link: routes.servidors() },
        { label: nombreServidor },
      ]}
      actionButtons={actionButtons}
    >
      <ServidorCell id={id} />
    </ScaffoldLayout>
  )
}

export default ServidorPage
