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
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ servidor }) => {
  const [updateServidor, { loading, error }] = useMutation(
    UPDATE_SERVIDOR_MUTATION,
    {
      onCompleted: () => {
        toast.success('Servidor updated')
        navigate(routes.servidors())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input, id) => {
    updateServidor({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <header className="rw-segment-header">
        <h2 className="rw-heading rw-heading-secondary">
          Edit Servidor {servidor?.id}
        </h2>
      </header>
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
