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
      estado_operativo
      estado
      cod_plataforma
      proxmox_vmid
      identity_key
      id_servidor
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
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
      creadoPor {
        id
        nombres
        primer_apellido
      }
      modificadoPor {
        id
        nombres
        primer_apellido
      }
      servidores {
        id
        nombre
      }
    }
  }
`

export const Loading = () => <div>Cargando máquinas virtuales...</div>

export const Empty = () => (
  <div className="rw-text-center">
    No existen máquinas registradas.{' '}
    <Link to={routes.newMaquina()} className="rw-link">
      Crear una nueva
    </Link>
  </div>
)

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ maquinas }) => {
  return <Maquinas maquinas={maquinas}/>
}