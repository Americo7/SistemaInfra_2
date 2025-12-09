import { navigate, routes } from '@redwoodjs/router'
import { useMutation, useQuery } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { gql } from '@redwoodjs/web'

import ServidorForm from 'src/components/Servidor/ServidorForm'

export const QUERY = gql`
  query EditServidorById($id: Int!) {
    servidor: servidor(id: $id) {
      id
      nombre
      cod_inventario_agetic
      cod_tipo_servidor
      tipoServidorInfo {
        id
        nombre
      }
      serie
      marca
      modelo
      ram
      almacenamiento
      ip_primaria
      sistema_operativo
      estado_operativo
      estadoOperativoInfo {
        id
        nombre
        codigo
      }
      estado
      id_data_center
      id_padre
      identity_key
    }
    # Listas para los Selects del formulario
    dataCenters {
      id
      nombre
    }
    servidores {
      id
      nombre
      ip_primaria
    }
    # Usamos la query específica definida en tu service
    parametros: parametrosFormularioServidor {
      id
      codigo
      nombre
      grupo
    }
  }
`

const UPDATE_SERVIDOR_MUTATION = gql`
  mutation UpdateServidorMutation($id: Int!, $input: UpdateServidorInput!) {
    updateServidor(id: $id, input: $input) {
      id
      identity_key # Retornamos para verificar cambios
      fecha_modificacion
      usuario_modificacion
    }
  }
`

export const Loading = () => <div>Cargando formulario...</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

export const Success = ({ servidor, dataCenters, servidores, parametros }) => {
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
    // Conversión de tipos para asegurar integridad
    const inputLimpio = {
      ...input,
      id_padre: input.id_padre ? parseInt(input.id_padre) : null,
      id_data_center: input.id_data_center ? parseInt(input.id_data_center) : null,
      ram: input.ram ? parseInt(input.ram) : null,
      almacenamiento: input.almacenamiento ? parseInt(input.almacenamiento) : null,
      // Eliminamos identity_key del input porque el update lo maneja internamente
      identity_key: undefined 
    }
    
    updateServidor({ variables: { id, input: inputLimpio } })
  }

  return (
    <div className="rw-segment">
      <div className="rw-segment-main">
        <ServidorForm
          servidor={servidor}
          dataCenters={dataCenters}
          servidores={servidores}
          parametros={parametros}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}