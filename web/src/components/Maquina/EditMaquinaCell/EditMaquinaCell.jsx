import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web' // Quitamos useQuery de aquí
import { toast } from '@redwoodjs/web/toast'
import { gql } from '@redwoodjs/web'

import MaquinaForm from 'src/components/Maquina/MaquinaForm'

export const QUERY = gql`
  query EditMaquinaById($id: Int!) {
    # 1. Datos de la máquina
    maquina: maquina(id: $id) {
      id
      nombre
      ip
      so
      ram
      almacenamiento
      estado_operativo
      cpu
      estado
      cod_plataforma
      id_servidor
      proxmox_vmid
      identity_key
      usuario_creacion
      usuario_modificacion
      fecha_creacion
      fecha_modificacion
    }

    servidores {
      id
      nombre
    }
    
    parametros: parametrosFormularioMaquina {
      id
      codigo
      nombre
      grupo
    }
  }
`

const UPDATE_MAQUINA_MUTATION = gql`
  mutation UpdateMaquinaMutation($id: Int!, $input: UpdateMaquinaInput!) {
    updateMaquina(id: $id, input: $input) {
      id
      nombre
      ip
      estado
      fecha_modificacion
      usuario_modificacion
    }
  }
`

export const Loading = () => <div>Cargando...</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

// Ahora recibimos todo junto en los props: maquina, servidores, parametros
export const Success = ({ maquina, servidores, parametros }) => {
  
  const [updateMaquina, { loading, error }] = useMutation(
    UPDATE_MAQUINA_MUTATION,
    {
      onCompleted: () => {
        toast.success('Máquina actualizada correctamente')
        navigate(routes.maquinas())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input, id) => {
    updateMaquina({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <div className="rw-segment-main">
        <MaquinaForm
          maquina={maquina}
          onSave={onSave}
          error={error}
          loading={loading}
          // Pasamos los datos que ya cargó el Cell
          servidores={servidores}
          parametros={parametros}
        />
      </div>
    </div>
  )
}