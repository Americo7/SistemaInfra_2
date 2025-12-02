import { routes, navigate } from '@redwoodjs/router'
import { useQuery, useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import DespliegueCell from 'src/components/Despliegue/DespliegueCell'

const QUERY = gql`
  query Despliegue($id: Int!) {
    despliegue(id: $id) {
      id
      descripcion
    }
  }
`

const DELETE_MUTATION = gql`
  mutation DeleteDespliegue($id: Int!) {
    deleteDespliegue(id: $id) {
      id
    }
  }
`

const DesplieguePage = ({ id }) => {
  const { data } = useQuery(QUERY, { variables: { id } })
  const descripcion = data?.despliegue?.descripcion || 'Cargando…'

  const [deleteDespliegue] = useMutation(DELETE_MUTATION, {
    onCompleted: () => {
      toast.success('Despliegue eliminado')
      navigate(routes.despliegues())
    },
    onError: (err) => toast.error(err?.message || 'Error al eliminar'),
  })

  const actionButtons = [
    {
      label: 'Editar',
      iconName: 'edit',
      variant: 'contained',
      onClick: () => navigate(routes.editDespliegue({ id })),
    },
    {
      label: 'Eliminar',
      iconName: 'delete',
      variant: 'outlined',
      color: 'error',
      onClick: () => {
        if (confirm(`¿Eliminar este despliegue?`)) {
          deleteDespliegue({ variables: { id } })
        }
      },
    },
  ]

  return (
    <ScaffoldLayout
      title="Despliegues"
      titleTo="despliegues"
      groupTitle="Despliegues"
      breadcrumbItems={[
        { label: 'Detalle' }
      ]}
      actionButtons={actionButtons}
    >
      <DespliegueCell id={id} />
    </ScaffoldLayout>
  )
}

export default DesplieguePage
