import { routes, navigate } from '@redwoodjs/router'
import { useQuery, useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import SistemaCell from 'src/components/Sistema/SistemaCell'

const QUERY = gql`
  query Sistema($id: Int!) {
    sistema(id: $id) {
      id
      nombre
      sigla
      codigo
      descripcion
      estado
    }
  }
`

const DELETE_MUTATION = gql`
  mutation DeleteSistema($id: Int!) {
    deleteSistema(id: $id) {
      id
    }
  }
`

const SistemaPage = ({ id }) => {
  const { data } = useQuery(QUERY, { variables: { id } })

  const titulo = data?.sistema?.nombre || `Sistema #${id}`

  const [deleteSistema] = useMutation(DELETE_MUTATION, {
    onCompleted: () => {
      toast.success('Sistema eliminado')
      navigate(routes.sistemas())
    },
    onError: (err) => toast.error(err?.message || 'Error al eliminar'),
  })

  const actionButtons = [
    {
      label: 'Editar',
      iconName: 'edit',
      variant: 'contained',
      onClick: () => navigate(routes.editSistema({ id })),
    },
    {
      label: 'Eliminar',
      iconName: 'delete',
      variant: 'outlined',
      color: 'error',
      onClick: () => {
        if (confirm(`¿Eliminar el sistema "${titulo}"?`)) {
          deleteSistema({ variables: { id } })
        }
      },
    },
  ]

  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: "Despliegues" },
        { label: 'Sistemas', link: routes.sistemas() },
      ]}
      actionButtons={actionButtons}
    >
      <SistemaCell id={id} />
    </ScaffoldLayout>
  )
}

export default SistemaPage