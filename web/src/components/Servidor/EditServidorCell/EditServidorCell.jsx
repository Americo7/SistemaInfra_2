import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import ServidorForm from 'src/components/Servidor/ServidorForm'

export const QUERY = gql`
  query EditServidorById($id: Int!) {
    servidor: servidor(id: $id) {
      id
      cod_inventario_agetic
      nombre
      ram
      almacenamiento
      estado_operativo
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
      id_data_center
      serie
      id_padre
      cod_tipo_servidor
      marca
      modelo
      ip_primaria
      sistema_operativo
      identity_key
    }
  }
`

const UPDATE_SERVIDOR_MUTATION = gql`
  mutation UpdateServidorMutation($id: Int!, $input: UpdateServidorInput!) {
    updateServidor(id: $id, input: $input) {
      id
      cod_inventario_agetic
      nombre
      ram
      almacenamiento
      estado_operativo
      estado
      fecha_modificacion
      usuario_modificacion
      id_data_center
      serie
      id_padre
      cod_tipo_servidor
      marca
      modelo
      ip_primaria
      sistema_operativo
      identity_key
    }
  }
`

export const Loading = () => <div>Cargando...</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ servidor }) => {
  const [updateServidor, { loading, error }] = useMutation(
    UPDATE_SERVIDOR_MUTATION,
    {
      onCompleted: () => {
        toast.success('Servidor actualizado correctamente')
        navigate(routes.servidors())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input, id) => {
    // Conversión de tipos para asegurar que no enviamos strings vacíos a campos Int
    const inputLimpio = {
      ...input,
      id_padre: input.id_padre ? parseInt(input.id_padre) : null,
      id_data_center: input.id_data_center ? parseInt(input.id_data_center) : null,
      ram: input.ram ? parseInt(input.ram) : null,
      almacenamiento: input.almacenamiento ? parseInt(input.almacenamiento) : null,
    }
    
    updateServidor({ variables: { id, input: inputLimpio } })
  }

  return (
    <div className="rw-segment">
      <div className="rw-segment-main">
        <ServidorForm
          servidor={servidor}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}