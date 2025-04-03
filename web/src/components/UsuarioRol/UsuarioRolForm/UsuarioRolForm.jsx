import {
  Form,
  FormError,
  FieldError,
  Label,
  NumberField,
  RadioField,
  DatetimeLocalField,
  Submit,
} from '@redwoodjs/forms'

const formatDatetime = (value) => {
  if (value) {
    return value.replace(/:\d{2}\.\d{3}\w/, '')
  }
}

const UsuarioRolForm = (props) => {
  const onSubmit = (data) => {
    props.onSave(data, props?.usuarioRol?.id)
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
          name="id_usuario"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Id usuario
        </Label>

        <NumberField
          name="id_usuario"
          defaultValue={props.usuarioRol?.id_usuario}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="id_usuario" className="rw-field-error" />

        <Label
          name="id_rol"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Id rol
        </Label>

        <NumberField
          name="id_rol"
          defaultValue={props.usuarioRol?.id_rol}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="id_rol" className="rw-field-error" />

        <Label
          name="id_maquina"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Id maquina
        </Label>

        <NumberField
          name="id_maquina"
          defaultValue={props.usuarioRol?.id_maquina}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="id_maquina" className="rw-field-error" />

        <Label
          name="id_sistema"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Id sistema
        </Label>

        <NumberField
          name="id_sistema"
          defaultValue={props.usuarioRol?.id_sistema}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="id_sistema" className="rw-field-error" />

        <Label
          name="estado"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Estado
        </Label>

        <div className="rw-check-radio-items">
          <RadioField
            id="usuarioRol-estado-0"
            name="estado"
            defaultValue="ACTIVO"
            defaultChecked={props.usuarioRol?.estado?.includes('ACTIVO')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />

          <div>Activo</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="usuarioRol-estado-1"
            name="estado"
            defaultValue="INACTIVO"
            defaultChecked={props.usuarioRol?.estado?.includes('INACTIVO')}
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
          defaultValue={props.usuarioRol?.usuario_creacion}
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
          defaultValue={formatDatetime(props.usuarioRol?.fecha_modificacion)}
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
          defaultValue={props.usuarioRol?.usuario_modificacion}
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

export default UsuarioRolForm
