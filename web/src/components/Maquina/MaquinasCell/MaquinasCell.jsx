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
      servidores {
        id
        nombre
      }

      # --- AUDITORÍA ---
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
    }
    
    # ✅ CORRECCIÓN AQUÍ: Agregamos "ESTADO_OPERATIVO" al array para traer ambos grupos
    parametros(grupo: ["PLATAFORMA", "ESTADO_OPERATIVO"]) {
      codigo
      nombre
      grupo
    }
    
    usuarios {
      id
      nombres
      primer_apellido
      segundo_apellido
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

export const Success = ({ maquinas, parametros, usuarios }) => {
  return <Maquinas maquinas={maquinas} parametros={parametros} usuarios={usuarios} />
}