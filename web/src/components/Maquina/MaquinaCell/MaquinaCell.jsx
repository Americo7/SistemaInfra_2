// web/src/components/Maquina/MaquinaCell/MaquinaCell.jsx

import { useQuery } from '@redwoodjs/web'
import Maquina from 'src/components/Maquina/Maquina'

export const QUERY = gql`
  query MaquinaCompleta($id: Int!) {
    maquinaCompleta(id: $id) {
      id
      nombre
      proxmox_vmid
      identity_key
      ip
      so
      ram
      almacenamiento
      estado_operativo
      cpu
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
      cod_plataforma
      servidores {
        id
        nombre
        ip_primaria
        data_centers {
          id
          nombre
        }
        cluster_nodos {
          id
          nodoTipo
          rol
          cluster {
            id
            nombre
            cod_tipo_cluster
            descripcion
            estado
          }
        }
      }

      cluster_nodos {
        id
        nombre
        nodoTipo
        rol
        cluster {
          id
          nombre
          cod_tipo_cluster
          descripcion
          estado
        }
        servidor {
          id
          nombre
          ip_primaria
          data_centers {
            id
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
        estado
        eventos {
          id
          cod_tipo_evento
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

// --------------------------------------
// QUERY: obtener nombre de tipo cluster
// --------------------------------------
// Nota: Esta consulta es ineficiente pero necesaria mientras no tengamos
// una tabla de parámetros en el esquema principal del Cell. La mantenemos.
export const GET_TIPO_CLUSTER = gql`
  query GetTipoCluster($codigo: String!) {
    parametroByCodigo(codigo: $codigo) {
      nombre
    }
  }
`
export const Loading = () => <div>Cargando...</div>
export const Empty = () => <div>No existe la máquina</div>
export const Failure = ({ error }) => <div className="rw-cell-error">{error?.message}</div>

export const Success = ({ maquinaCompleta }) => { // Se remueve 'usuarios' de props
  const codigoTipoCluster =
    maquinaCompleta?.cluster_nodos?.[0]?.cluster?.cod_tipo_cluster

  // ✔ OPTIMIZACIÓN: Dejar el hook para el Service de Parámetros
  const { data: tipoClusterData } = useQuery(GET_TIPO_CLUSTER, {
    variables: { codigo: codigoTipoCluster },
    skip: !codigoTipoCluster,
  })

  const tipoClusterNombre = tipoClusterData?.parametroByCodigo?.nombre || null

  return (
    <Maquina
      maquina={maquinaCompleta}
      // ❌ Se remueve 'usuarios' de props
      tipoClusterNombre={tipoClusterNombre}
    />
  )
}