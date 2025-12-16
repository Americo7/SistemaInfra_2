import { gql } from '@redwoodjs/web'
import Despliegue from 'src/components/Despliegue/Despliegue'

export const QUERY = gql`
  query FindDespliegueBase($id: Int!) {
    despliegue: despliegue(id: $id) {
      id
      id_componente
      id_maquina
      id_servidor
      descripcion
      fecha_despliegue
      estado
      fecha_solicitud
      unidadInfo {
        id
        codigo
        nombre
      }
      unidad_solicitante
      solicitante
      cod_tipo_respaldo
      referencia_respaldo
      estado_despliegue
      estado
      
      # --- NUEVOS CAMPOS ---
      version_aplicacion
      git_commit
      tipo_despliegue
      tipoDespliegueInfo { # Nuevo resolver
        id
        codigo
        nombre
      }
      # ---------------------

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
      componentes {
        id
        nombre
        dominio
        entornoInfo {
          id
          codigo
          nombre
        }
        sistemas {
          id
          nombre
        }
      }
      # 2. Máquina Virtual (con sus relaciones de Cluster y Host)
      maquinas {
        id
        nombre
        # Proxmox
        servidores {
          id
          nombre
          data_centers {
            id
            nombre
          }
          cluster_nodos {
            id
            nombre
            nodoTipo
            cluster {
              id
              nombre
              tipoClusterInfo {
                id
                codigo
                nombre
              }
            }
          }
        }
        # k8s
        cluster_nodos {
          id
          nombre
          nodoTipo
          rolInfo {
            id
            codigo
            nombre
          }
          cluster {
            id
            nombre
            tipoClusterInfo {
              id
              codigo
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
// ... (Resto del archivo Loading, Empty, Failure, Success igual)
export const Loading = () => <div>Cargando despliegue...</div>
export const Empty = () => <div>Despliegue no encontrado</div>
export const Failure = ({ error }) => <div className="rw-cell-error">{error?.message}</div>
export const Success = ({ despliegue, parametrosFormularioDespliegue }) => {
  return (
    <Despliegue
      despliegue={despliegue}
      componente={despliegue.componentes}
      maquina={despliegue.maquinas}
      servidor={despliegue.servidores}
      parametros={parametrosFormularioDespliegue}
    />
  )
}