import { routes, navigate } from '@redwoodjs/router'
import { useQuery, useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import ParametroCell from 'src/components/Parametro/ParametroCell'

const QUERY = gql`
  query Parametro($id: Int!) {
    parametro(id: $id) {
      id
      nombre
    }
  }
`

const DELETE_MUTATION = gql`
  mutation DeleteParametro($id: Int!) {
    deleteParametro(id: $id) {
      id
    }
  }
`

const ParametroPage = ({ id }) => {
  const { data } = useQuery(QUERY, { variables: { id } })
  const nombreParametro = data?.parametro?.nombre || 'Cargando…'

  const [deleteParametro] = useMutation(DELETE_MUTATION, {
    onCompleted: () => {
      toast.success('Parámetro eliminado')
      navigate(routes.parametros())
    },
    onError: (err) => toast.error(err?.message || 'Error al eliminar'),
  })

  const actionButtons = [
    {
      label: 'Editar',
      iconName: 'edit',
      variant: 'contained',
      onClick: () => navigate(routes.editParametro({ id })),
    },
    {
      label: 'Eliminar',
      iconName: 'delete',
      variant: 'outlined',
      color: 'error',
      onClick: () => {
        if (confirm(`¿Eliminar el parámetro "${nombreParametro}"?`)) {
          deleteParametro({ variables: { id } })
        }
      },
    },
  ]

  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Parámetros', link: routes.parametros() },
        { label: nombreParametro },
      ]}
      actionButtons={actionButtons}
    >
      <ParametroCell id={id} />
    </ScaffoldLayout>
  )
}

export default ParametroPage
