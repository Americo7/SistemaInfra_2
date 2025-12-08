import { useQuery, gql } from '@redwoodjs/web'
import ClusterNodo from 'src/components/ClusterNodo/ClusterNodo'

export const QUERY = gql`
  query FindClusterNodoById($id: Int!) {
    clusterNodo(id: $id) {
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
        id
        nombre
      }
      
      creadoPor {
        id
        nombres
        primer_apellido
        segundo_apellido
      }
      
      modificadoPor {
        id
        nombres
        primer_apellido
        segundo_apellido
      }
      
      rolInfo {
        id
        codigo
        nombre
      }
      
      # Relación si es nodo virtual
      maquina {
        id
        nombre
      }
      
      # Relación si es nodo físico (Incluyendo VMs anidadas)
      servidor {
        id     
        nombre
        maquinas {
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

export const Loading = () => <div>Cargando detalle del nodo...</div>

export const Empty = () => <div>No se encontró el Nodo de Cluster con ese ID</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error" style={{ color: '#d32f2f' }}>
    Error: {error?.message}
  </div>
)

export const Success = ({ clusterNodo }) => {
  return <ClusterNodo clusterNodo={clusterNodo} />
}