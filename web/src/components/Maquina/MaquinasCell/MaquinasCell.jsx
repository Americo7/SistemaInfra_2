import { Link, routes } from '@redwoodjs/router'
import { gql } from '@redwoodjs/web'
import Maquinas from 'src/components/Maquina/Maquinas'

export const QUERY = gql`
  query FindMaquinas {
    maquinas {
      id
      nombre
      ip
      so
      ram
      cpu
      almacenamiento
      proxmox_vmid
      cod_plataforma
      estado_operativo
      estado
      
      # --- AUDITORÍA ---
      fecha_creacion
      fecha_modificacion
      
      # --- INFORMACIÓN CATALOGADA ---
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
      
      # --- USUARIOS DE AUDITORÍA ---
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
      servidores {
        id
        nombre
        ip_primaria
        marca
        modelo
        cod_tipo_servidor
        tipoServidorInfo {
          nombre
        }
        data_centers {
          id
          nombre
        }
        cluster_nodos {
          id
          nombre
          cluster {
            id
            nombre
            tipoClusterInfo {
              id
              nombre
            }
          }
        }
      }

      # --- CLUSTER SI LA VM ES NODO ---
      cluster_nodos {
        id
        nombre
        cluster {
          id
          nombre
          tipoClusterInfo {
            id
            nombre
          }
        }
      }

      # --- DATOS PROFUNDOS PARA REPORTE DETALLADO (Agregados) ---
      usuario_roles {
        id
        usuarios {
          nombres
          primer_apellido
          segundo_apellido
        }
        roles {
          nombre
        }
        sistemas {
          sigla
        }
      }

      despliegue {
        id
        fecha_despliegue
        estado_despliegue
        componentes {
          nombre
          sistemas {
            sigla
          }
        }
      }
      
      infra_afectada {
        id
        eventos {
            id
            cod_evento
            descripcion
        }
      }
    }
  }
`

export const Loading = () => <div>Cargando máquinas virtuales...</div>

export const isEmpty = () => false

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ maquinas }) => {
  return <Maquinas maquinas={maquinas} />
}