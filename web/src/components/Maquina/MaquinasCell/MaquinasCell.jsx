import { Link, routes } from '@redwoodjs/router'
import { gql } from '@redwoodjs/web' 
import Maquinas from 'src/components/Maquina/Maquinas'

export const QUERY = gql`
  query FindMaquinas {
    maquinas {
      id
      nombre
      ip
      ram
      cpu
      proxmox_vmid
      estado_operativo
      estado
      
      # --- 2. AUDITORÍA ---
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
      
      # --- 3. RELACIONES SIMPLIFICADAS (ID y NOMBRE) ---
      
      # 3A. Infos (Cátalogo)
      plataformaInfo {
        id
        nombre
      }
      estadoOperativoInfo {
        id
        nombre
      }
      
      # 3B. Auditoría Usuarios
      creadoPor {
        id
        nombres
        primer_apellido
      }
      modificadoPor {
        id
        nombres
        primer_apellido
      }
      
      # 3C. Host (Servidor) y Data Center
      servidores {
        id
        nombre
        # Data Center del Host
        data_centers { 
          id
          nombre
        }
        # Si el Servidor Host es parte de un Cluster
        cluster_nodos { 
          id
          nombre
          cluster {
            id
            nombre
          }
        }
      }

      # 3D. Máquina como Nodo (Si la VM es un nodo K8s/Proxmox)
      cluster_nodos {
        id
        nombre
        cluster {
          id
          nombre
        }
      }
    }
  }
`

export const Loading = () => <div>Cargando máquinas virtuales...</div>

export const Empty = () => (
  <div className="rw-text-center">
    No existen máquinas registradas.{' '}
    <Link to={routes.newMaquina()} className="rw-link">
      Crear una nueva
    </Link>
  </div>
)

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ maquinas }) => {
  return <Maquinas maquinas={maquinas}/>
}