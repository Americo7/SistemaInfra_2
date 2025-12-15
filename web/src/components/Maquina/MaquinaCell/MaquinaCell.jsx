import { gql } from '@redwoodjs/web'
import Maquina from 'src/components/Maquina/Maquina'

export const QUERY = gql`
  query FindMaquinaById($id: Int!) {
    maquina(id: $id) {
      id
      nombre
      proxmox_vmid
      identity_key
      ip
      so
      ram
      almacenamiento
      cpu
      estado
      fecha_creacion
      fecha_modificacion

      # --- NUEVOS RESOLVERS (Objetos anidados) ---
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
      plataformaInfo {
        nombre
        codigo
      }
      estadoOperativoInfo {
        nombre
        codigo
      }

      # --- RELACIONES ---
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
          rolInfo {
            id
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

      # Kubernetes / Orquestación
      cluster_nodos {
        id
        nombre
        nodoTipo
        rolInfo {
          id
          nombre
          codigo
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

      usuario_roles {
        id
        usuarios {
          id
          nombres
          primer_apellido
          segundo_apellido
        }
        roles {
          id
          nombre
        }
      }

      despliegue {
        id
        fecha_despliegue
        estado_despliegue
        estadoDespliegueInfo {
          id
          codigo
          nombre
        }
        descripcion
        componentes {
          id
          nombre
          sistemas {
            id
            nombre
            sigla
            descripcion
            estado
            componentes {
              id
              nombre
              dominio
              estado
            }
          }
        }
      }

      infra_afectada {
        id
        eventos {
          id
          cod_evento
          cod_tipo_evento
          tipoEventoInfo {
            id
            nombre  
            codigo
          }
          estadoEventoInfo {
            id
            nombre
            codigo
          }  
          descripcion
          fecha_evento
          estado_evento
          fecha_creacion
          solicitante
        }
      }
    }
  }
`

export const Loading = () => <div>Cargando...</div>
export const Empty = () => <div>No existe la máquina</div>
export const Failure = ({ error }) => <div className="rw-cell-error">{error?.message}</div>

export const Success = ({ maquina }) => {
  return <Maquina maquina={maquina} />
}