import { navigate, routes } from '@redwoodjs/router'
import { useMutation, gql } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'
import { Box, CircularProgress, Alert } from '@mui/material'

import ParametroForm from 'src/components/Parametro/ParametroForm'
import ScaffoldLayout from 'src/layouts/ScaffoldLayout'

export const QUERY = gql`
  query EditParametroById($id: Int!) {
    parametro: parametro(id: $id) {
      id
      codigo
      nombre
      grupo
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
      descripcion
    }
  }
`

const UPDATE_PARAMETRO_MUTATION = gql`
  mutation UpdateParametroMutation($id: Int!, $input: UpdateParametroInput!) {
    updateParametro(id: $id, input: $input) {
      id
      codigo
      nombre
      grupo
      estado
      fecha_creacion
      usuario_creacion
      fecha_modificacion
      usuario_modificacion
      descripcion
    }
  }
`

// 1. Loading con estilo MUI
export const Loading = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
    <CircularProgress />
  </Box>
)

// 2. Failure con Alerta MUI
export const Failure = ({ error }) => (
  <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 4, p: 2 }}>
    <Alert severity="error">
      Error al cargar el registro: {error?.message}
    </Alert>
  </Box>
)

export const Success = ({ parametro }) => {
  const [updateParametro, { loading, error }] = useMutation(
    UPDATE_PARAMETRO_MUTATION,
    {
      onCompleted: () => {
        toast.success('Parámetro actualizado correctamente')
        navigate(routes.parametros())
      },
      onError: (error) => {
        // Opcional: El formulario ya muestra el error visualmente, 
        // pero puedes dejar esto por si es un error de red.
        // toast.error(error.message)
      },
    }
  )

  const onSave = (input, id) => {
    updateParametro({ variables: { id, input } })
  }

  // 3. Estructura con ScaffoldLayout
  return (
    <ScaffoldLayout
      title="Editar Parámetro"
      titleTo="parametros"
      breadcrumbItems={[
        { label: 'Parámetros', link: routes.parametros() },
        // Mostramos el nombre o código del item actual en el breadcrumb
        { label: parametro.nombre || parametro.codigo }, 
        { label: 'Editar' }
      ]}
    >
      <ParametroForm
        parametro={parametro}
        onSave={onSave}
        error={error}
        loading={loading}
      />
    </ScaffoldLayout>
  )
}