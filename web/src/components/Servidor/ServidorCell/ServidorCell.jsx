import { useQuery, gql } from '@redwoodjs/web'
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
      
      # --- 3. CLASIFICACIÓN (Códigos + Info Legible) ---
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

      # --- 5. AUDITORÍA ---
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

      # --- 6. RELACIONES HIJAS (Listas) ---
      
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
        estado_operativo
      }

      # Participación en Clusters
      cluster_nodos {
        id
        nombre    # Agregado: Importante para identificar el nodo
        nodoTipo
        rol
        estado
        cluster {
          id
          nombre
          cod_tipo_cluster
        }
      }

      # Despliegues de Sistemas
      despliegue {
        id
        estado_despliegue
        fecha_despliegue
        componentes {
          id
          nombre
        }
      }

      # Historial de Incidentes
      infra_afectada {
        id
        estado
        eventos {
          id
          cod_tipo_evento
          descripcion
          fecha_evento
          estado_evento
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