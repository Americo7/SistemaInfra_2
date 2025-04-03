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

const ServidorForm = (props) => {
  const onSubmit = (data) => {
    props.onSave(data, props?.servidor?.id)
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
          name="id_hardware"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Id hardware
        </Label>

        <NumberField
          name="id_hardware"
          defaultValue={props.servidor?.id_hardware}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="id_hardware" className="rw-field-error" />

        <Label
          name="serie_servidor"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Serie servidor
        </Label>

        <TextField
          name="serie_servidor"
          defaultValue={props.servidor?.serie_servidor}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="serie_servidor" className="rw-field-error" />

        <Label
          name="cod_inventario_agetic"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Cod inventario agetic
        </Label>

        <TextField
          name="cod_inventario_agetic"
          defaultValue={props.servidor?.cod_inventario_agetic}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="cod_inventario_agetic" className="rw-field-error" />

        <Label
          name="chasis"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Chasis
        </Label>

        <TextField
          name="chasis"
          defaultValue={props.servidor?.chasis}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="chasis" className="rw-field-error" />

        <Label
          name="cuchilla"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Cuchilla
        </Label>

        <TextField
          name="cuchilla"
          defaultValue={props.servidor?.cuchilla}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="cuchilla" className="rw-field-error" />

        <Label
          name="ram"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Ram
        </Label>

        <NumberField
          name="ram"
          defaultValue={props.servidor?.ram}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="ram" className="rw-field-error" />

        <Label
          name="almacenamiento"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Almacenamiento
        </Label>

        <NumberField
          name="almacenamiento"
          defaultValue={props.servidor?.almacenamiento}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="almacenamiento" className="rw-field-error" />

        <Label
          name="estado_operativo"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Estado operativo
        </Label>

        <TextField
          name="estado_operativo"
          defaultValue={props.servidor?.estado_operativo}
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
            id="servidor-estado-0"
            name="estado"
            defaultValue="ACTIVO"
            defaultChecked={props.servidor?.estado?.includes('ACTIVO')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />

          <div>Activo</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="servidor-estado-1"
            name="estado"
            defaultValue="INACTIVO"
            defaultChecked={props.servidor?.estado?.includes('INACTIVO')}
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
          defaultValue={props.servidor?.usuario_creacion}
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
          defaultValue={formatDatetime(props.servidor?.fecha_modificacion)}
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
          defaultValue={props.servidor?.usuario_modificacion}
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

export default ServidorForm
