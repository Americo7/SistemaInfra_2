import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  SelectField,
  Submit,
} from '@redwoodjs/forms'
import { useQuery } from '@redwoodjs/web'

const GET_PARAMETROS = gql`
  query GetParametrosRoles {
    parametros {
      id
      codigo
      nombre
      grupo
    }
  }
`

const RoleForm = (props) => {
  const { data: parametrosData } = useQuery(GET_PARAMETROS)

  const parametrosDeEntorno = parametrosData?.parametros.filter((param) => {
    return param.grupo === 'TIPO_ROL'
  })

  const onSubmit = (data) => {
    const formData = {
      ...data,
      estado: props.role ? data.estado : 'ACTIVO',
      usuario_modificacion: 1,
      usuario_creacion: 1,
    }
    props.onSave(formData, props?.role?.id)
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
          defaultValue={props.role?.nombre}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />
        <FieldError name="nombre" className="rw-field-error" />

        <Label className="input-label">Tipo de Rol</Label>
        <SelectField
          name="cod_tipo_rol"
          defaultValue={props.rol?.cod_tipo_rol || ''}
          className="input-field select-field"
        >
          <option value="">Seleccionar Tipo Rol...</option>
          {parametrosDeEntorno?.map((tipoRol) => (
            <option key={tipoRol.id} value={tipoRol.codigo}>
              {tipoRol.nombre}
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
          defaultValue={props.role?.descripcion}
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

export default RoleForm
