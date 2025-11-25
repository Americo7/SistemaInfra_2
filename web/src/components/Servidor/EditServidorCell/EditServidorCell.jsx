import { navigate, routes } from '@redwoodjs/router'
import { useMutation, useQuery } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import ServidorForm from 'src/components/Servidor/ServidorForm'

// --- CONSULTAS ADICIONALES PARA DROPDOWNS ---

const GET_DATA_CENTERS = gql`
  query GetDataCentersForEditServidor {
    dataCenters {
      id
      nombre
    }
  }
`

const GET_SERVIDORS = gql`
  query GetServidorsForEditServidor {
    servidores {
      id
      nombre
    }
  }
`
// ---------------------------------------------


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
      # -- CAMPOS NUEVOS --
      ip_primaria       # <- AGREGADO
      sistema_operativo # <- AGREGADO
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
      # -- CAMPOS NUEVOS --
      ip_primaria
      sistema_operativo
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ servidor }) => {
  // ✔ HOOKS DE CONSULTA PARA DROPDOWNS
  const { data: dataCentersData } = useQuery(GET_DATA_CENTERS)
  const { data: servidorsData } = useQuery(GET_SERVIDORS)


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
    // Nota: Aquí, la función onSave en el formulario debe asegurarse de enviar
    // usuario_modificacion y fecha_modificacion al input.
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
          // ✔ PROPS ADICIONALES PARA DROPDOWNS
          dataCenters={dataCentersData?.dataCenters || []}
          servidors={servidorsData?.servidores || []}
        />
      </div>
    </div>
  )
}