import Cluster from 'src/components/Cluster/Cluster'

export const QUERY = gql`
  query FindClusterById($id: Int!) {
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
      cluster_nodos {
        id
        nombre
        nodoTipo
        rol
        maquina {
          id
          nombre
        }

        # Relación si es nodo físico (servidor)
        servidor {
          id
          nombre
          # Necesario para el Tab de "Máquinas" en lógica Proxmox
          maquinas {
            id
            nombre
            ip
            proxmox_vmid
            ram
            so
            cpu
            estado_operativo
            
          }
        }
      }
    }

    # Traemos usuarios para resolver los nombres en la auditoría
    usuarios {
      id
      nombres
      primer_apellido
      segundo_apellido
    }
  }
`

export const Loading = () => <div>Cargando Cluster...</div>

export const Empty = () => <div>El Cluster no existe</div>

export const Failure = ({ error }) => (
  <div style={{ color: 'red' }}>Error: {error?.message}</div>
)

export const Success = ({ cluster, usuarios }) => {
  return <Cluster cluster={cluster} usuarios={usuarios} />
}