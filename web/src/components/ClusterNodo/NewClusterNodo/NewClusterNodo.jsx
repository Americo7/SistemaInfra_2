import { navigate, routes } from '@redwoodjs/router'
import { useMutation, useQuery } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

import ClusterNodoForm from 'src/components/ClusterNodo/ClusterNodoForm'

// 1. QUERY PARA OBTENER LISTAS (Clusters, Máquinas, Servidores y Parámetros)
const GET_OPTIONS = gql`
  query GetNewNodeOptions {
    clusters {
      id
      nombre
      cod_tipo_cluster
    }
    maquinas {
      id
      nombre
      ip
    }
    servidores {
      id
      nombre
      ip_primaria
    }
    # Trae tanto NODO_ROL como TIPO_CLUSTER (según tu fix en el backend)
    parametros: parametrosFormularioClusterNodo {
      id
      codigo
      nombre
      grupo
    }
  }
`

const CREATE_CLUSTER_NODO_MUTATION = gql`
  mutation CreateClusterNodoMutation($input: CreateClusterNodoInput!) {
    createClusterNodo(input: $input) {
      id
    }
  }
`

const NewClusterNodo = () => {
  // 2. EJECUTAR QUERY CON NO-CACHE
  // 'network-only' fuerza a pedir los datos al servidor, ignorando la caché vieja.
  const { data, loading: loadingOptions } = useQuery(GET_OPTIONS, {
    fetchPolicy: 'network-only',
  })

  const [createClusterNodo, { loading, error }] = useMutation(
    CREATE_CLUSTER_NODO_MUTATION,
    {
      onCompleted: () => {
        toast.success('Nodo creado exitosamente')
        navigate(routes.clusterNodos())
      },
      onError: (error) => {
        toast.error(error.message)
      },
    }
  )

  const onSave = (input) => {
    createClusterNodo({ variables: { input } })
  }

  // 3. PANTALLA DE CARGA
  // Esperamos a que lleguen las opciones antes de pintar el formulario
  if (loadingOptions) {
    return (
      <div className="rw-segment">
        <div className="rw-segment-main" style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          Cargando opciones...
        </div>
      </div>
    )
  }

  return (
    <div className="rw-segment">
      <div className="rw-segment-main">
        {/* 4. PASAR DATOS AL FORMULARIO */}
        <ClusterNodoForm 
          onSave={onSave} 
          loading={loading} 
          error={error}
          
          // Usamos encadenamiento opcional (?.) y valores por defecto (|| [])
          clusters={data?.clusters || []}
          maquinas={data?.maquinas || []}
          servidores={data?.servidores || []}
          parametros={data?.parametros || []}
        />
      </div>
    </div>
  )
}

export default NewClusterNodo