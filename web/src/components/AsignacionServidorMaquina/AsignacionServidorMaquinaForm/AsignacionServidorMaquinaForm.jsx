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

const AsignacionServidorMaquinaForm = (props) => {
  const onSubmit = (data) => {
    props.onSave(data, props?.asignacionServidorMaquina?.id)
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
          name="id_servidor"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Id servidor
        </Label>

        <NumberField
          name="id_servidor"
          defaultValue={props.asignacionServidorMaquina?.id_servidor}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="id_servidor" className="rw-field-error" />

        <Label
          name="id_maquina"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Id maquina
        </Label>

        <NumberField
          name="id_maquina"
          defaultValue={props.asignacionServidorMaquina?.id_maquina}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="id_maquina" className="rw-field-error" />

        <Label
          name="id_cluster"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Id cluster
        </Label>

        <NumberField
          name="id_cluster"
          defaultValue={props.asignacionServidorMaquina?.id_cluster}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="id_cluster" className="rw-field-error" />

        <Label
          name="estado"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Estado
        </Label>

        <div className="rw-check-radio-items">
          <RadioField
            id="asignacionServidorMaquina-estado-0"
            name="estado"
            defaultValue="ACTIVO"
            defaultChecked={props.asignacionServidorMaquina?.estado?.includes(
              'ACTIVO'
            )}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />

          <div>Activo</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="asignacionServidorMaquina-estado-1"
            name="estado"
            defaultValue="INACTIVO"
            defaultChecked={props.asignacionServidorMaquina?.estado?.includes(
              'INACTIVO'
            )}
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
          defaultValue={props.asignacionServidorMaquina?.usuario_creacion}
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
          defaultValue={formatDatetime(
            props.asignacionServidorMaquina?.fecha_modificacion
          )}
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
          defaultValue={props.asignacionServidorMaquina?.usuario_modificacion}
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

export default AsignacionServidorMaquinaForm
