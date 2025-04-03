import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  RadioField,
  NumberField,
  DatetimeLocalField,
  Submit,
} from '@redwoodjs/forms'

const formatDatetime = (value) => {
  if (value) {
    return value.replace(/:\d{2}\.\d{3}\w/, '')
  }
}

const UsuarioForm = (props) => {
  const onSubmit = (data) => {
    props.onSave(data, props?.usuario?.id)
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
          name="id_ciudadano_digital"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Id ciudadano digital
        </Label>

        <TextField
          name="id_ciudadano_digital"
          defaultValue={props.usuario?.id_ciudadano_digital}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="id_ciudadano_digital" className="rw-field-error" />

        <Label
          name="nombre_usuario"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Nombre usuario
        </Label>

        <TextField
          name="nombre_usuario"
          defaultValue={props.usuario?.nombre_usuario}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="nombre_usuario" className="rw-field-error" />

        <Label
          name="contrasena"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Contrasena
        </Label>

        <TextField
          name="contrasena"
          defaultValue={props.usuario?.contrasena}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="contrasena" className="rw-field-error" />

        <Label
          name="nro_documento"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Nro documento
        </Label>

        <TextField
          name="nro_documento"
          defaultValue={props.usuario?.nro_documento}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="nro_documento" className="rw-field-error" />

        <Label
          name="nombres"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Nombres
        </Label>

        <TextField
          name="nombres"
          defaultValue={props.usuario?.nombres}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="nombres" className="rw-field-error" />

        <Label
          name="primer_apellido"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Primer apellido
        </Label>

        <TextField
          name="primer_apellido"
          defaultValue={props.usuario?.primer_apellido}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="primer_apellido" className="rw-field-error" />

        <Label
          name="segundo_apellido"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Segundo apellido
        </Label>

        <TextField
          name="segundo_apellido"
          defaultValue={props.usuario?.segundo_apellido}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="segundo_apellido" className="rw-field-error" />

        <Label
          name="celular"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Celular
        </Label>

        <TextField
          name="celular"
          defaultValue={props.usuario?.celular}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="celular" className="rw-field-error" />

        <Label
          name="email"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Email
        </Label>

        <TextField
          name="email"
          defaultValue={props.usuario?.email}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="email" className="rw-field-error" />

        <Label
          name="estado"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Estado
        </Label>

        <div className="rw-check-radio-items">
          <RadioField
            id="usuario-estado-0"
            name="estado"
            defaultValue="ACTIVO"
            defaultChecked={props.usuario?.estado?.includes('ACTIVO')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />

          <div>Activo</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="usuario-estado-1"
            name="estado"
            defaultValue="INACTIVO"
            defaultChecked={props.usuario?.estado?.includes('INACTIVO')}
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
          defaultValue={props.usuario?.usuario_creacion}
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
          defaultValue={formatDatetime(props.usuario?.fecha_modificacion)}
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
          defaultValue={props.usuario?.usuario_modificacion}
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

export default UsuarioForm
