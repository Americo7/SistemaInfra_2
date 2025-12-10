import { Link, routes } from '@redwoodjs/router'
import { gql } from '@redwoodjs/web'
// Importación con ruta absoluta al componente de lista
import Despliegues from 'src/components/Despliegue/Despliegues/Despliegues'

export const QUERY = gql`
  query FindDespliegues {
    despliegues {
      id
      descripcion
      fecha_despliegue
      fecha_solicitud
      unidad_solicitante
      solicitante
      cod_tipo_respaldo
      referencia_respaldo
      estado_despliegue
      estado
      
      # --- AUDITORÍA ---
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
      
      # --- RELACIONES DE CATÁLOGO ---
      tipoRespaldoInfo {
        id
        codigo
        nombre
      }
      estadoDespliegueInfo {
        id
        codigo
        nombre
      }
      
      # --- RELACIONES DE USUARIOS ---
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
      
      # --- RELACIONES DE INFRAESTRUCTURA ---
      
      # 1. Componente y Sistema
      componentes {
        id
        nombre
        sistemas { 
          id
          nombre
          sigla
        }
      }
      
      # 2. Máquina Virtual (con sus relaciones de Cluster y Host)
      maquinas {
        id
        nombre
        # Si la VM pertenece directamente a un cluster
        cluster_nodos {
          cluster {
            id
            nombre
          }
        }
        # Host donde reside la VM (para ver si el Host está en un cluster)
        servidores {
          id
          nombre
          cluster_nodos {
            cluster {
              id
              nombre
            }
          } 
        }  
      }
      
      # 3. Servidor Físico (Despliegue directo en Bare Metal)
      servidores {
        id
        nombre
        cluster_nodos {
          cluster {
            id
            nombre
          }
        }
      }
    }
  }
`

export const Loading = () => <div>Cargando despliegues...</div>

export const isEmpty = () => false

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ despliegues }) => {
  return <Despliegues despliegues={despliegues} />
}