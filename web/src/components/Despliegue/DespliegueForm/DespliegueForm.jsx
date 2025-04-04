import {
  Form,
  FormError,
  FieldError,
  Label,
  NumberField,
  DatetimeLocalField,
  RadioField,
  TextField,
  Submit,
} from '@redwoodjs/forms'

const formatDatetime = (value) => {
  if (value) {
    return value.replace(/:\d{2}\.\d{3}\w/, '')
  }
}

const DespliegueForm = (props) => {
  const onSubmit = (data) => {
    props.onSave(data, props?.despliegue?.id)
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
          name="id_componente"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Id componente
        </Label>

        <NumberField
          name="id_componente"
          defaultValue={props.despliegue?.id_componente}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="id_componente" className="rw-field-error" />

        <Label
          name="id_maquina"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Id maquina
        </Label>

        <NumberField
          name="id_maquina"
          defaultValue={props.despliegue?.id_maquina}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="id_maquina" className="rw-field-error" />

        <Label
          name="fecha_despliegue"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Fecha despliegue
        </Label>

        <DatetimeLocalField
          name="fecha_despliegue"
          defaultValue={formatDatetime(props.despliegue?.fecha_despliegue)}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="fecha_despliegue" className="rw-field-error" />

        <Label
          name="estado"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Estado
        </Label>

        <div className="rw-check-radio-items">
          <RadioField
            id="despliegue-estado-0"
            name="estado"
            defaultValue="ACTIVO"
            defaultChecked={props.despliegue?.estado?.includes('ACTIVO')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />

          <div>Activo</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="despliegue-estado-1"
            name="estado"
            defaultValue="INACTIVO"
            defaultChecked={props.despliegue?.estado?.includes('INACTIVO')}
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
          defaultValue={props.despliegue?.usuario_creacion}
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
          defaultValue={formatDatetime(props.despliegue?.fecha_modificacion)}
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
          defaultValue={props.despliegue?.usuario_modificacion}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="usuario_modificacion" className="rw-field-error" />

        <Label
          name="fecha_solicitud"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Fecha solicitud
        </Label>

        <DatetimeLocalField
          name="fecha_solicitud"
          defaultValue={formatDatetime(props.despliegue?.fecha_solicitud)}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="fecha_solicitud" className="rw-field-error" />

        <Label
          name="unidad_solicitante"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Unidad solicitante
        </Label>

        <TextField
          name="unidad_solicitante"
          defaultValue={props.despliegue?.unidad_solicitante}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="unidad_solicitante" className="rw-field-error" />

        <Label
          name="solicitante"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Solicitante
        </Label>

        <TextField
          name="solicitante"
          defaultValue={props.despliegue?.solicitante}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="solicitante" className="rw-field-error" />

        <Label
          name="cod_tipo_respaldo"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Cod tipo respaldo
        </Label>

        <TextField
          name="cod_tipo_respaldo"
          defaultValue={props.despliegue?.cod_tipo_respaldo}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="cod_tipo_respaldo" className="rw-field-error" />

        <Label
          name="referencia_respaldo"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Referencia respaldo
        </Label>

        <TextField
          name="referencia_respaldo"
          defaultValue={props.despliegue?.referencia_respaldo}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="referencia_respaldo" className="rw-field-error" />

        <Label
          name="estado_despliegue"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Estado despliegue
        </Label>

        <TextField
          name="estado_despliegue"
          defaultValue={props.despliegue?.estado_despliegue}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="estado_despliegue" className="rw-field-error" />

        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Save
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default DespliegueForm
