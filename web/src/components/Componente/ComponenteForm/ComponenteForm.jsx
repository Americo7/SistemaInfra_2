import {
  Form,
  FormError,
  FieldError,
  Label,
  NumberField,
  TextField,
  TextAreaField,
  RadioField,
  DatetimeLocalField,
  Submit,
} from '@redwoodjs/forms'

const formatDatetime = (value) => {
  if (value) {
    return value.replace(/:\d{2}\.\d{3}\w/, '')
  }
}

const ComponenteForm = (props) => {
  const onSubmit = (data) => {
    props.onSave(data, props?.componente?.id)
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
          name="id_sistema"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Id sistema
        </Label>

        <NumberField
          name="id_sistema"
          defaultValue={props.componente?.id_sistema}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="id_sistema" className="rw-field-error" />

        <Label
          name="nombre"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Nombre
        </Label>

        <TextField
          name="nombre"
          defaultValue={props.componente?.nombre}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="nombre" className="rw-field-error" />

        <Label
          name="dominio"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Dominio
        </Label>

        <TextField
          name="dominio"
          defaultValue={props.componente?.dominio}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="dominio" className="rw-field-error" />

        <Label
          name="descripcion"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Descripcion
        </Label>

        <TextField
          name="descripcion"
          defaultValue={props.componente?.descripcion}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="descripcion" className="rw-field-error" />

        <Label
          name="cod_entorno"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Cod entorno
        </Label>

        <TextField
          name="cod_entorno"
          defaultValue={props.componente?.cod_entorno}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="cod_entorno" className="rw-field-error" />

        <Label
          name="cod_categoria"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Cod categoria
        </Label>

        <TextField
          name="cod_categoria"
          defaultValue={props.componente?.cod_categoria}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="cod_categoria" className="rw-field-error" />

        <Label
          name="gitlab_repo"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Gitlab repo
        </Label>

        <TextField
          name="gitlab_repo"
          defaultValue={props.componente?.gitlab_repo}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="gitlab_repo" className="rw-field-error" />

        <Label
          name="gitlab_rama"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Gitlab rama
        </Label>

        <TextField
          name="gitlab_rama"
          defaultValue={props.componente?.gitlab_rama}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="gitlab_rama" className="rw-field-error" />

        <Label
          name="tecnologia"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Tecnologia
        </Label>

        <TextAreaField
          name="tecnologia"
          defaultValue={JSON.stringify(props.componente?.tecnologia)}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ valueAsJSON: true }}
        />

        <FieldError name="tecnologia" className="rw-field-error" />

        <Label
          name="estado"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Estado
        </Label>

        <div className="rw-check-radio-items">
          <RadioField
            id="componente-estado-0"
            name="estado"
            defaultValue="ACTIVO"
            defaultChecked={props.componente?.estado?.includes('ACTIVO')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />

          <div>Activo</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="componente-estado-1"
            name="estado"
            defaultValue="INACTIVO"
            defaultChecked={props.componente?.estado?.includes('INACTIVO')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />

          <div>Inactivo</div>
        </div>

        <FieldError name="estado" className="rw-field-error" />

        <Label
          name="usuario_creacion"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Usuario creacion
        </Label>

        <NumberField
          name="usuario_creacion"
          defaultValue={props.componente?.usuario_creacion}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="usuario_creacion" className="rw-field-error" />

        <Label
          name="fecha_modificacion"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Fecha modificacion
        </Label>

        <DatetimeLocalField
          name="fecha_modificacion"
          defaultValue={formatDatetime(props.componente?.fecha_modificacion)}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="fecha_modificacion" className="rw-field-error" />

        <Label
          name="usuario_modificacion"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Usuario modificacion
        </Label>

        <NumberField
          name="usuario_modificacion"
          defaultValue={props.componente?.usuario_modificacion}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="usuario_modificacion" className="rw-field-error" />

        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Save
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default ComponenteForm
