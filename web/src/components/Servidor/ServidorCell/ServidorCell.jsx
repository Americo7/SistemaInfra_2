import { gql } from '@redwoodjs/web'
import Servidor from 'src/components/Servidor/Servidor'

export const QUERY = gql`
  query FindServidorById($id: Int!) {
    servidor(id: $id) {
      # --- 1. DATOS GENERALES ---
      id
      nombre
      cod_inventario_agetic
      serie
      marca
      modelo
      identity_key
      estado

      # --- 2. ESPECIFICACIONES TÉCNICAS ---
      ram
      almacenamiento
      ip_primaria
      sistema_operativo

      # --- 3. CLASIFICACIÓN ---
      cod_tipo_servidor
      tipoServidorInfo {
        nombre
      }
      estado_operativo
      estadoOperativoInfo {
        nombre
        codigo
      }

      # --- 4. UBICACIÓN Y JERARQUÍA ---
      id_data_center
      data_centers {
        id
        nombre
      }
      servidores_padre {
        id
        nombre
      }
      fecha_creacion
      fecha_modificacion
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

      # Máquinas Virtuales
      maquinas {
        id
        nombre
        proxmox_vmid
        ip
        so
        ram
        cpu
        almacenamiento
        estadoOperativoInfo {
          id
          nombre
          codigo
        }
      }

      # Participación en Clusters
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

      # Despliegues de Sistemas
      despliegue {
        id
        fecha_despliegue
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
          sistemas{
            id
            sigla
            nombre  
            codigo
            descripcion
            estado
            entidades {
              id
              nombre
              sigla
            }  
          }
        }
      }

      # Historial de Incidentes
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

export const Loading = () => <div>Cargando detalle del servidor...</div>

export const Empty = () => <div>No se encontró el servidor solicitado.</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error" style={{ color: '#d32f2f' }}>
    Error al cargar servidor: {error?.message}
  </div>
)

export const Success = ({ servidor }) => {
  return <Servidor servidor={servidor} />
}