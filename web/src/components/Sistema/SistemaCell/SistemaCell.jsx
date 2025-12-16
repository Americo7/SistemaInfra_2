import Sistema from 'src/components/Sistema/Sistema'

export const QUERY = gql`
  query FindSistemaById($id: Int!) {
    sistema: sistema(id: $id) {
      id
      nombre
      sigla
      codigo
      descripcion
      estado
      fecha_creacion
      fecha_modificacion
      ra_creacion
      
      # Auditoría
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
      
      # Entidad
      entidades {
        id
        nombre
        sigla
      }

      # Componentes y Despliegues Profundos
      componentes {
        id
        nombre
        dominio
        gitlab_repo
        gitlab_rama
        estado
        entornoInfo {
          id
          codigo
          nombre
        }
        categoriaInfo {
          id
          codigo
          nombre
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
            almacenamiento
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
            estado_operativo
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

      # Usuarios
      usuario_roles {
        id
        roles {
          id
          nombre
        }
        usuarios {
          id
          nombres
          primer_apellido
          segundo_apellido
          nombre_usuario
          nro_documento
          nombres
          celular
          email
          estado
        }
      }
    }
  }
`

export const Loading = () => <div className="rw-cell-loading">Cargando sistema...</div>

export const Empty = () => <div className="rw-cell-empty">Sistema no encontrado</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error" style={{ color: 'red' }}>Error: {error?.message}</div>
)

export const Success = ({ sistema }) => {
  return <Sistema sistema={sistema} />
}