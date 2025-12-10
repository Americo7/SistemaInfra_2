import { navigate, routes } from '@redwoodjs/router'

import { useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import ComponenteForm from 'src/components/Componente/ComponenteForm'

export const QUERY = gql`
  query EditComponenteById($id: Int!) {
    componente: componente(id: $id) {
      id
      id_sistema
      nombre
      dominio
      descripcion
      cod_entorno
      cod_categoria
      gitlab_repo
      gitlab_rama
      tecnologia
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
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
      tecnologiaInfo {
        id
        codigo
        nombre
      }
    }
    sistemas {
      id
      nombre
      estado
    }

    parametros: parametrosFormularioComponente { 
      id
      codigo
      nombre
      grupo
    }
  }
`

const UPDATE_COMPONENTE_MUTATION = gql`
  mutation UpdateComponenteMutation($id: Int!, $input: UpdateComponenteInput!) {
    updateComponente(id: $id, input: $input) {
      id
      nombre
      estado
      fecha_modificacion
      usuario_modificacion
    }
  }
`

export const Loading = () => <div>Loading...</div>

export const Failure = ({ error }) => (
  <div className="rw-cell-error">{error?.message}</div>
)

// Ahora, la data desestructurada 'parametros' viene directamente del alias de la QUERY.
export const Success = ({ componente, sistemas, parametros }) => {
  const [updateComponente, { loading, error }] = useMutation(
    UPDATE_COMPONENTE_MUTATION,
    {
      onCompleted: () => {
        toast.success('Componente actualizado correctamente')
        navigate(routes.componentes())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input, id) => {
    // Si la tecnología es un array vacío, se envía directamente.
    // Si es JSON, Prisma lo manejará.
    updateComponente({ variables: { id, input } })
  }

  return (
    <div className="rw-segment">
      <div className="rw-segment-main">
        <ComponenteForm
          componente={componente}
          sistemas={sistemas}
          // El prop 'parametros' ahora contiene la data de 'parametrosFormularioComponente'
          parametros={parametros}
          onSave={onSave}
          error={error}
          loading={loading}
        />
      </div>
    </div>
  )
}