import {
  Form,
  FormError,
  FieldError,
  Label,
  NumberField,
  TextField,
  RadioField,
  DatetimeLocalField,
  Submit,
} from '@redwoodjs/forms'

const formatDatetime = (value) => {
  if (value) {
    return value.replace(/:\d{2}\.\d{3}\w/, '')
  }
}

const HardwareForm = (props) => {
  const onSubmit = (data) => {
    props.onSave(data, props?.hardware?.id)
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
          name="id_data_center"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Id data center
        </Label>

        <NumberField
          name="id_data_center"
          defaultValue={props.hardware?.id_data_center}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="id_data_center" className="rw-field-error" />

        <Label
          name="serie"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Serie
        </Label>

        <TextField
          name="serie"
          defaultValue={props.hardware?.serie}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="serie" className="rw-field-error" />

        <Label
          name="cod_activo_agetic"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Cod activo agetic
        </Label>

        <TextField
          name="cod_activo_agetic"
          defaultValue={props.hardware?.cod_activo_agetic}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="cod_activo_agetic" className="rw-field-error" />

        <Label
          name="cod_tipo_hw"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Cod tipo hw
        </Label>

        <TextField
          name="cod_tipo_hw"
          defaultValue={props.hardware?.cod_tipo_hw}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="cod_tipo_hw" className="rw-field-error" />

        <Label
          name="marca"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Marca
        </Label>

        <TextField
          name="marca"
          defaultValue={props.hardware?.marca}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="marca" className="rw-field-error" />

        <Label
          name="modelo"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Modelo
        </Label>

        <TextField
          name="modelo"
          defaultValue={props.hardware?.modelo}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="modelo" className="rw-field-error" />

        <Label
          name="estado_operativo"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Estado operativo
        </Label>

        <TextField
          name="estado_operativo"
          defaultValue={props.hardware?.estado_operativo}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="estado_operativo" className="rw-field-error" />

        <Label
          name="estado"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Estado
        </Label>

        <div className="rw-check-radio-items">
          <RadioField
            id="hardware-estado-0"
            name="estado"
            defaultValue="ACTIVO"
            defaultChecked={props.hardware?.estado?.includes('ACTIVO')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />

          <div>Activo</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="hardware-estado-1"
            name="estado"
            defaultValue="INACTIVO"
            defaultChecked={props.hardware?.estado?.includes('INACTIVO')}
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
          defaultValue={props.hardware?.usuario_creacion}
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
          defaultValue={formatDatetime(props.hardware?.fecha_modificacion)}
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
          defaultValue={props.hardware?.usuario_modificacion}
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

export default HardwareForm
