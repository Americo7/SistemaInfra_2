import { navigate, routes } from '@redwoodjs/router'
import { useMutation, useQuery } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import MaquinaForm from 'src/components/Maquina/MaquinaForm'

// --- CONSULTAS PARA DROPDOWNS ---
const GET_SERVIDORES = gql`
  query GetServidoresForEditMaquina {
    servidores {
      id
      nombre
    }
  }
`

const GET_PARAMETROS = gql`
  query GetParametrosForEditMaquina {
    parametros(grupo: ["ESTADO", "PLATAFORMA"]) {
      id
      codigo
      nombre
      grupo
    }
  }
`
// --------------------------------

export const QUERY = gql`
  query EditMaquinaById($id: Int!) {
    maquina: maquina(id: $id) {
      id
      nombre
      ip
      so
      ram
      almacenamiento
      cpu
      estado
      cod_plataforma
      id_servidor

      # --- CAMPOS DE SYNC ---
      uuid
      proxmox_vmid
      mac_address

      # --- AUDITORIA ---
      usuario_creacion
      usuario_modificacion
      fecha_creacion
      fecha_modificacion
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

export const Success = ({ maquina }) => {
  // ✔ Cargar datos para los Selects del formulario
  const { data: servidoresData } = useQuery(GET_SERVIDORES)
  const { data: parametrosData } = useQuery(GET_PARAMETROS)

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
          // ✔ Pasamos las listas al formulario
          servidores={servidoresData?.servidores || []}
          parametros={parametrosData?.parametros || []}
        />
      </div>
    </div>
  )
}