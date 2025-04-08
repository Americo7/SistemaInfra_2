import {
  Form,
  FormError,
  FieldError,
  Label,
  SelectField,
  TextField,
  Submit,
} from '@redwoodjs/forms'
import { useQuery } from '@redwoodjs/web'
const GET_PARAMETROS = gql`
  query GetParametrosCluster {
    parametros {
      id
      codigo
      nombre
      grupo
    }
  }
`

const ClusterForm = (props) => {
  const { data: parametrosData } = useQuery(GET_PARAMETROS)

  const parametrosDeCluster = parametrosData?.parametros.filter((param) => {
    return param.grupo === 'TIPO_CLUSTER'
  })
  const onSubmit = (data) => {
    const formData = {
      ...data,
      cod_tipo_cluster: data.cod_tipo_cluster,
      estado: 'ACTIVO',
      usuario_modificacion: 2,
      usuario_creacion: 3,
    }
    props.onSave(formData, props?.cluster?.id)
  }

  return (
    <div className="rw-form-wrapper">
      <Form onSubmit={onSubmit} error={props.error}>
        <FormError
          error={props.error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />

        <Label
          name="nombre"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Nombre
        </Label>

        <TextField
          name="nombre"
          defaultValue={props.cluster?.nombre}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="nombre" className="rw-field-error" />

        <Label className="input-label">Entorno</Label>
        <SelectField
          name="cod_entorno"
          defaultValue={props.cluster?.cod_entorno || ''}
          className="input-field select-field"
        >
          <option value="">Seleccionar Cluster...</option>
          {parametrosDeCluster?.map((cluster) => (
            <option key={cluster.id} value={cluster.codigo}>
              {cluster.nombre}
            </option>
          ))}
        </SelectField>
        <Label
          name="descripcion"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Descripcion
        </Label>

        <TextField
          name="descripcion"
          defaultValue={props.cluster?.descripcion}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="descripcion" className="rw-field-error" />

        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Save
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default ClusterForm
