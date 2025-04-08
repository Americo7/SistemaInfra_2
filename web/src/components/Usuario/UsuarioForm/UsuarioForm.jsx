import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  Submit,
} from '@redwoodjs/forms'

const UsuarioForm = (props) => {
  const onSubmit = (data) => {
    const formData = {
      ...data,
      estado: 'ACTIVO',
      usuario_modificacion: 2,
      usuario_creacion: 3,
    }
    props.onSave(formData, props?.usuario?.id)
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
