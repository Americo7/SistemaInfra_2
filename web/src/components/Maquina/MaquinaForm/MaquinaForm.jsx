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

const MaquinaForm = (props) => {
  const onSubmit = (data) => {
    props.onSave(data, props?.maquina?.id)
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
          name="codigo"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Codigo
        </Label>

        <NumberField
          name="codigo"
          defaultValue={props.maquina?.codigo}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="codigo" className="rw-field-error" />

        <Label
          name="cod_tipo_maquina"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Cod tipo maquina
        </Label>

        <TextField
          name="cod_tipo_maquina"
          defaultValue={props.maquina?.cod_tipo_maquina}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="cod_tipo_maquina" className="rw-field-error" />

        <Label
          name="nombre"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Nombre
        </Label>

        <TextField
          name="nombre"
          defaultValue={props.maquina?.nombre}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="nombre" className="rw-field-error" />

        <Label
          name="ip"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Ip
        </Label>

        <TextField
          name="ip"
          defaultValue={props.maquina?.ip}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="ip" className="rw-field-error" />

        <Label
          name="so"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          So
        </Label>

        <TextField
          name="so"
          defaultValue={props.maquina?.so}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="so" className="rw-field-error" />

        <Label
          name="ram"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Ram
        </Label>

        <NumberField
          name="ram"
          defaultValue={props.maquina?.ram}
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

        <TextAreaField
          name="almacenamiento"
          defaultValue={JSON.stringify(props.maquina?.almacenamiento)}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ valueAsJSON: true, required: true }}
        />

        <FieldError name="almacenamiento" className="rw-field-error" />

        <Label
          name="cpu"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Cpu
        </Label>

        <NumberField
          name="cpu"
          defaultValue={props.maquina?.cpu}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="cpu" className="rw-field-error" />

        <Label
          name="estado"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Estado
        </Label>

        <div className="rw-check-radio-items">
          <RadioField
            id="maquina-estado-0"
            name="estado"
            defaultValue="ACTIVO"
            defaultChecked={props.maquina?.estado?.includes('ACTIVO')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />

          <div>Activo</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="maquina-estado-1"
            name="estado"
            defaultValue="INACTIVO"
            defaultChecked={props.maquina?.estado?.includes('INACTIVO')}
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
          defaultValue={props.maquina?.usuario_creacion}
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
          defaultValue={formatDatetime(props.maquina?.fecha_modificacion)}
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
          defaultValue={props.maquina?.usuario_modificacion}
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

export default MaquinaForm
