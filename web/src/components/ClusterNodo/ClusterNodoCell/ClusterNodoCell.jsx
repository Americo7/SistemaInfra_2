import ClusterNodo from 'src/components/ClusterNodo/ClusterNodo'

export const QUERY = gql`
  query FindClusterNodoById($id: Int!) {
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
      cluster {
        nombre
      }
      maquina {
        id
        nombre
      }
      servidor {
        id     
        nombre
        maquinas{
          id
          nombre
          proxmox_vmid
          ram
          so
          cpu
          estado_operativo
          ip
          cod_plataforma
        }
      }
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>ClusterNodo not found</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ clusterNodo }) => {
  return <ClusterNodo clusterNodo={clusterNodo} />
}