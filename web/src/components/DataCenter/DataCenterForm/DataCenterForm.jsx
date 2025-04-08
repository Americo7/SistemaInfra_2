import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  Submit,
} from '@redwoodjs/forms'

const DataCenterForm = (props) => {
  const onSubmit = (data) => {
    const formData = {
      ...data,
      estado: 'ACTIVO',
      usuario_modificacion: 1,
      usuario_creacion: 1,
    }
    props.onSave(formData, props?.dataCenter?.id)
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
          defaultValue={props.dataCenter?.nombre}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="nombre" className="rw-field-error" />

        <Label
          name="ubicacion"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Ubicacion
        </Label>

        <TextField
          name="ubicacion"
          defaultValue={props.dataCenter?.ubicacion}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="ubicacion" className="rw-field-error" />

        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Save
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default DataCenterForm
