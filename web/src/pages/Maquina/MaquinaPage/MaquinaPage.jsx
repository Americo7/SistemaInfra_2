import { routes, navigate } from '@redwoodjs/router'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'
import MaquinaCell from 'src/components/Maquina/MaquinaCell'
import { useQuery, useMutation } from '@redwoodjs/web'
import { gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

const MAQUINA_QUERY = gql`
  query GetMaquina($id: Int!) {
    maquina(id: $id) {
      id
      nombre
    }
  }
`

const DELETE_MAQUINA_MUTATION = gql`
  mutation DeleteMaquina($id: Int!) {
    deleteMaquina(id: $id) {
      id
    }
  }
`

const MaquinaPage = ({ id }) => {
  const { data } = useQuery(MAQUINA_QUERY, { variables: { id } })
  const [deleteMaquina] = useMutation(DELETE_MAQUINA_MUTATION, {
    onCompleted: () => {
      toast.success('Máquina eliminada')
      navigate(routes.maquinas())
    },
    onError: (err) => {
      toast.error(err?.message || 'Error al eliminar')
    },
  })

  const nombreMaquina = data?.maquina?.nombre || 'Cargando...'

  const handleDelete = () => {
    if (confirm(`¿Eliminar la máquina "${nombreMaquina}"? Esta acción no se puede deshacer.`)) {
      deleteMaquina({ variables: { id } })
    }
  }

  const actionButtons = [
    {
      label: 'Editar',
      iconName: 'edit',
      variant: 'contained',
      onClick: () => navigate(routes.editMaquina({ id })),
    },
    {
      label: 'Eliminar',
      iconName: 'delete',
      variant: 'outlined',
      color: 'error',
      onClick: handleDelete,
    },
  ]

  return (
    <ScaffoldLayout
      breadcrumbItems={[
        { label: 'Maquinas', link: routes.maquinas() },
        { label: nombreMaquina }
      ]}
      actionButtons={actionButtons}
    >
      <MaquinaCell id={id} />
    </ScaffoldLayout>
  )
}

export default MaquinaPage