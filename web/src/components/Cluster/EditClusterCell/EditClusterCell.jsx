import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import ClusterForm from 'src/components/Cluster/ClusterForm'

export const QUERY = gql`
  query EditClusterById($id: Int!) {
    cluster: cluster(id: $id) {
      id
      nombre
      cod_tipo_cluster
      descripcion
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
      id_proxmox_endpoint
      id_k8s_endpoint
      proxmox_endpoint {
        id
        nombre
        ip
        dominio
      }
      k8s_endpoint {
        id
        nombre
        url_api
      }
    }

    # Endpoints disponibles para seleccionar
    proxmoxEndpoints: proxmoxEndpoints {
      id
      nombre
      ip
      dominio
    }

    k8SEndpoints: k8SEndpoints {
      id
      nombre
      url_api
    }
  }
`

const UPDATE_CLUSTER_MUTATION = gql`
  mutation UpdateClusterMutation($id: Int!, $input: UpdateClusterInput!) {
    updateCluster(id: $id, input: $input) {
      id
      nombre
      cod_tipo_cluster
      descripcion
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion

      id_proxmox_endpoint
      id_k8s_endpoint

      proxmox_endpoint {
        id
        nombre
      }

      k8s_endpoint {
        id
        nombre
      }
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ cluster, proxmoxEndpoints, k8sEndpoints }) => {
  const [updateCluster, { loading, error }] = useMutation(
    UPDATE_CLUSTER_MUTATION,
    {
      onCompleted: () => {
        toast.success('Cluster actualizado correctamente')
        navigate(routes.clusters())
      },
      onError: (error) => toast.error(error.message),
    }
  )

  const onSave = (input, id) => {
    updateCluster({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <div className="rw-segment-main">
        <ClusterForm
          cluster={cluster}
          proxmoxEndpoints={proxmoxEndpoints}
          k8sEndpoints={k8sEndpoints}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}
