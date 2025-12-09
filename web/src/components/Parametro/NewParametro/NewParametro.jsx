import { navigate, routes } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

// 1. IMPORTA TU LAYOUT
import ScaffoldLayout from 'src/layouts/ScaffoldLayout' 
import ParametroForm from 'src/components/Parametro/ParametroForm'

const CREATE_PARAMETRO_MUTATION = gql`
  mutation CreateParametroMutation($input: CreateParametroInput!) {
    createParametro(input: $input) {
      id
    }
  }
`

const NewParametroPage = () => {
  const [createParametro, { loading, error }] = useMutation(
    CREATE_PARAMETRO_MUTATION,
    {
      onCompleted: () => {
        toast.success('Parámetro creado correctamente')
        navigate(routes.parametros())
      },
      onError: (error) => {
        // Opcional: toast.error(error.message)
        // El formulario ya maneja el error visualmente, así que no es estrictamente necesario aquí
      },
    }
  )

  const onSave = (input) => {
    createParametro({ variables: { input } })
  }

  // 2. USA EL SCAFFOLD LAYOUT AQUÍ
  return (
      <ParametroForm 
        onSave={onSave} 
        loading={loading} 
        error={error} 
      />
 
  )
}

export default NewParametroPage