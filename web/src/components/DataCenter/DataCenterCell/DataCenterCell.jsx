import { Link, routes } from '@redwoodjs/router'
import { Box, CircularProgress, Alert, Button } from '@mui/material'
import DataCenter from 'src/components/DataCenter/DataCenter'

export const QUERY = gql`
  query FindDataCenterById($id: Int!) {
    dataCenter: dataCenter(id: $id) {
      id
      nombre
      ubicacion
      estado
      fecha_creacion
      fecha_modificacion
      
      # Usuarios
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

      # TAB 1: SERVIDORES
      servidores {
        id
        nombre
        cod_inventario_agetic
        serie
        marca
        modelo
        estado
        ram
        almacenamiento
        ip_primaria
        sistema_operativo
        
        tipoServidorInfo { id nombre codigo }
        estadoOperativoInfo { id nombre codigo }
        servidores_padre { id nombre }

        # Clusters (Físicos)
        cluster_nodos {
          id
          nombre
          nodoTipo
          rolInfo { id codigo nombre }
          cluster {
            id
            nombre
            cod_tipo_cluster
            tipoClusterInfo { id nombre codigo }
          }
        }

        # Despliegues (Físicos)
        despliegue {
          id
          fecha_despliegue
          tipoRespaldoInfo { id codigo nombre }
          estadoDespliegueInfo { id codigo nombre }
          componentes {
            id
            nombre
            entornoInfo {
              codigo
              nombre
            }
            sistemas {
              id
              sigla
              nombre  
              codigo
              descripcion
              estado
              entidades { id nombre sigla }
            }
          }
        }
        
        # TAB 2: MÁQUINAS VIRTUALES
        maquinas {
          id
          proxmox_vmid
          nombre
          ip
          so
          ram
          cpu
          almacenamiento
          estadoOperativoInfo { id nombre codigo }
          
          # Corrección 1: Estructura correcta para Host Físico
          servidores { 
            id
            cluster_nodos {
              id
              rolInfo { id codigo nombre }
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
          } # <--- FALTABA ESTA LLAVE DE CIERRE
          
          # Corrección 2: Estructura correcta para K8s (sin doble cluster)
          cluster_nodos {
            id
            nombre
            nodoTipo
            rolInfo { id codigo nombre }
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

          despliegue {
            id
            fecha_despliegue
            tipoRespaldoInfo { id codigo nombre }
            estadoDespliegueInfo { id codigo nombre }
            componentes {
              id
              nombre
              entornoInfo {
                codigo
                nombre
              }
              sistemas {
                id
                sigla
                nombre  
                entidades { 
                  id
                  nombre
                  sigla
                }  
              }
            }
          }
        }
      }

      # TAB 5: EVENTOS
      infra_afectada {
        id
        eventos {
          id
          cod_evento
          descripcion
          fecha_evento
          estado_evento
          solicitante
          tipoEventoInfo { id nombre codigo }
          estadoEventoInfo { id nombre codigo }  
        }
      }
    }
  }
`

export const Loading = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
    <CircularProgress />
  </Box>
)

export const Empty = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
    <Alert severity="info">No se encontró información para el Data Center solicitado.</Alert>
  </Box>
)

export const Failure = ({ error }) => (
  <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 5 }}>
    <Alert 
      severity="error"
      action={
        <Button color="inherit" size="small" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      }
    >
      Error al cargar datos: {error?.message}
    </Alert>
  </Box>
)

export const Success = ({ dataCenter }) => {
  return <DataCenter dataCenter={dataCenter} />
}