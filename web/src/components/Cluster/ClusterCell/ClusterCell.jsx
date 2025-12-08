import { gql } from '@redwoodjs/web'
import Cluster from 'src/components/Cluster/Cluster'

export const QUERY = gql`
  query FindClusterById($id: Int!) {
    cluster(id: $id) {
      id
      nombre
      cod_tipo_cluster
      descripcion
      estado
      fecha_creacion
      fecha_modificacion
      
      # 1. INFO DEL TIPO (Objeto)
      tipoClusterInfo {
        id
        codigo
        nombre
      }

      # 2. USUARIOS (Objetos)
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

      # 3. RELACIÓN DE NODOS Y MÁQUINAS
      cluster_nodos {
        id
        nombre
        nodoTipo
        rol
        
        # CORRECCIÓN 1: rolInfo es un objeto, pedimos sus campos
        rolInfo {
          id
          nombre
          codigo
        }

        # Nodo vinculado a Servidor Físico
        servidor {
          id
          nombre
          ip_primaria
          
          # Las VMs viven dentro del servidor
          maquinas {
            id
            nombre
            ip
            proxmox_vmid
            ram
            cpu
            estado_operativo # Valor crudo (opcional si usas el Info)
            
            # CORRECCIÓN 2: Objetos dentro de maquinas (Servidor)
            plataformaInfo {
              id
              nombre
              codigo
            }
            estadoOperativoInfo {
              id
              nombre
              codigo
            }
          }
        }
        
        # Nodo vinculado a Máquina Virtual directa
        maquina {
            id
            nombre
            ip
            proxmox_vmid
            ram
            cpu
            estado_operativo # Valor crudo
            
            # CORRECCIÓN 3: Objetos dentro de maquina (Nodo)
            plataformaInfo {
              id
              nombre
              codigo
            }
            estadoOperativoInfo {
              id
              nombre
              codigo
            }
        }
      }
    }
  }
`

export const Loading = () => <div>Cargando...</div>
export const Empty = () => <div>No se encontró el Cluster.</div>
export const Failure = ({ error }) => <div style={{ color: 'red' }}>Error: {error?.message}</div>

export const Success = ({ cluster }) => {
  // Nota: Ya no pasamos 'parametros' porque toda la data viene resuelta en 'cluster'
  return <Cluster cluster={cluster} />
}