import Componente from 'src/components/Componente/Componente'
import { gql } from '@redwoodjs/web'

export const QUERY = gql`
  query FindComponenteById($id: Int!) {
    componente: componente(id: $id) {
      id
      id_sistema
      nombre
      dominio
      descripcion
      cod_entorno
      cod_categoria
      gitlab_repo
      gitlab_rama
      tecnologia
      estado
      fecha_creacion
      fecha_modificacion
      creadoPor {
        nombres
        primer_apellido
        segundo_apellido
      }
      modificadoPor {
        nombres
        primer_apellido
        segundo_apellido
      }
      entornoInfo {
        codigo
        nombre
      }
      categoriaInfo {
        codigo
        nombre
      }
      sistemas {
        id
        nombre
        sigla
      }
      # Despliegues
      despliegue {
        id
        fecha_despliegue
        tipoRespaldoInfo { id codigo nombre }
        estadoDespliegueInfo { id codigo nombre }
        
        # Destino 1: Máquinas Virtuales
        maquinas {
          id
          nombre
          ip
          so
          cpu
          ram
          almacenamientoTotal
          estadoOperativoInfo { codigo nombre }
          
          # Contexto 1: Host físico (Proxmox)
          servidores {
            id
            nombre
            cluster_nodos {
              id
              nombre
              cluster {
                id
                nombre
                tipoClusterInfo { codigo nombre }
              }
            }
          }
          
          # Contexto 2: Orquestación interna (K8s instalado en la VM)
          cluster_nodos {
            id
            nombre
            cluster {
              id
              nombre
              tipoClusterInfo { codigo nombre }
            }
          }
        }
      
        # Destino 2: Servidores Físicos (Bare Metal)
        servidores {
          id
          nombre
          ip_primaria
          sistema_operativo
          ram
          almacenamiento
          estadoOperativoInfo { codigo nombre }
          
          cluster_nodos {
            id
            nombre
            cluster {
              id
              nombre
              tipoClusterInfo { codigo nombre }
            }
          }
        }
      }
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Empty = () => <div>Componente not found</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ componente }) => {
  return <Componente componente={componente} />
}
