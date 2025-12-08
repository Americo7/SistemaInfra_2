import { navigate, routes } from '@redwoodjs/router'
import { useMutation, useQuery } from '@redwoodjs/web' // Asegúrate de importar useQuery si lo usas manualmente, aunque Cell lo hace solo
import { toast } from '@redwoodjs/web/toast'

import ClusterNodoForm from 'src/components/ClusterNodo/ClusterNodoForm'

export const QUERY = gql`
  query EditClusterNodoById($id: Int!) {
    clusterNodo: clusterNodo(id: $id) {
      id
      clusterId
      nombre
      nodoTipo
      maquinaId
      servidorId
      rol
      estado
      identity_key
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
    # Asumiendo que existen estas queries en tus SDLs globales
    servidores {
      id
      nombre
    }
    maquinas {
      id
      nombre
    }
    clusters {
      id
      nombre
    }
    # Esta viene de tu servicio actual
    parametros: parametrosFormularioClusterNodo {
      id
      codigo
      nombre
      grupo
    }
  }
`

const UPDATE_CLUSTER_NODO_MUTATION = gql`
  mutation UpdateClusterNodoMutation(
    $id: Int!
    $input: UpdateClusterNodoInput!
  ) {
    updateClusterNodo(id: $id, input: $input) {
      id
      identity_key # Retornamos esto para ver si cambió
    }
  }
`

export const Loading = () => <div>Cargando formulario...</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ 
  clusterNodo, 
  servidores, 
  maquinas, 
  clusters, 
  parametros 
}) => {
  const [updateClusterNodo, { loading, error }] = useMutation(
    UPDATE_CLUSTER_NODO_MUTATION,
    {
      onCompleted: () => {
        toast.success('Nodo de Cluster actualizado correctamente')
        navigate(routes.clusterNodos())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input, id) => {
    // Redwood automáticamente maneja las variables, pero aseguramos que el ID vaya
    updateClusterNodo({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <div className="rw-segment-main">
        <ClusterNodoForm
          clusterNodo={clusterNodo}
          servidores={servidores}
          maquinas={maquinas}
          clusters={clusters}
          parametros={parametros}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}