import {
  Form,
  FormError,
  FieldError,
  Label,
  NumberField,
  DatetimeLocalField,
  TextField,
  Submit,
} from '@redwoodjs/forms'

const formatDatetime = (value) => {
  if (value) {
    return value.replace(/:\d{2}\.\d{3}\w/, '')
  }
}

const EventosBitacoraForm = (props) => {
  const onSubmit = (data) => {
    const formData = {
      ...data,

      usuario_modificacion: 2,
      usuario_creacion: 3,
    }
    props.onSave(formData, props?.evento?.id)
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
          name="id_evento"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Id evento
        </Label>

        <NumberField
          name="id_evento"
          defaultValue={props.eventosBitacora?.id_evento}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="id_evento" className="rw-field-error" />

        <Label
          name="descripcion"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Descripcion
        </Label>

        <TextField
          name="descripcion"
          defaultValue={props.eventosBitacora?.descripcion}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="descripcion" className="rw-field-error" />

        <Label
          name="estado_anterior"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Estado anterior
        </Label>

        <TextField
          name="estado_anterior"
          defaultValue={props.eventosBitacora?.estado_anterior}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="estado_anterior" className="rw-field-error" />

        <Label
          name="estado_actual"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Estado actual
        </Label>

        <TextField
          name="estado_actual"
          defaultValue={props.eventosBitacora?.estado_actual}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="estado_actual" className="rw-field-error" />

        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Save
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default EventosBitacoraForm
