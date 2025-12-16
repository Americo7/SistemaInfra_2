import {
  Form,
  FormError,
  FieldError,
  Label,
  RadioField,
  NumberField,
  TextField,
  TextAreaField,
  DatetimeLocalField,
  Submit,
} from '@redwoodjs/forms'

const formatDatetime = (value) => {
  if (value) {
    return value.replace(/:\d{2}\.\d{3}\w/, '')
  }
}

const EndpointSyncLogForm = (props) => {
  const onSubmit = (data) => {
    props.onSave(data, props?.endpointSyncLog?.id)
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
          name="tipo_endpoint"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Tipo endpoint
        </Label>

        <div className="rw-check-radio-items">
          <RadioField
            id="endpointSyncLog-tipo_endpoint-0"
            name="tipo_endpoint"
            defaultValue="PROXMOX"
            defaultChecked={props.endpointSyncLog?.tipo_endpoint?.includes(
              'PROXMOX'
            )}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />

          <div>Proxmox</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="endpointSyncLog-tipo_endpoint-1"
            name="tipo_endpoint"
            defaultValue="K8S"
            defaultChecked={props.endpointSyncLog?.tipo_endpoint?.includes(
              'K8S'
            )}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />

          <div>K8s</div>
        </div>

        <FieldError name="tipo_endpoint" className="rw-field-error" />

        <Label
          name="id_proxmox_endpoint"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Id proxmox endpoint
        </Label>

        <NumberField
          name="id_proxmox_endpoint"
          defaultValue={props.endpointSyncLog?.id_proxmox_endpoint}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="id_proxmox_endpoint" className="rw-field-error" />

        <Label
          name="id_k8s_endpoint"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Id k8s endpoint
        </Label>

        <NumberField
          name="id_k8s_endpoint"
          defaultValue={props.endpointSyncLog?.id_k8s_endpoint}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="id_k8s_endpoint" className="rw-field-error" />

        <Label
          name="estado_sync"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Estado sync
        </Label>

        <div className="rw-check-radio-items">
          <RadioField
            id="endpointSyncLog-estado_sync-0"
            name="estado_sync"
            defaultValue="INICIADO"
            defaultChecked={props.endpointSyncLog?.estado_sync?.includes(
              'INICIADO'
            )}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />

          <div>Iniciado</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="endpointSyncLog-estado_sync-1"
            name="estado_sync"
            defaultValue="EXITOSO"
            defaultChecked={props.endpointSyncLog?.estado_sync?.includes(
              'EXITOSO'
            )}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />

          <div>Exitoso</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="endpointSyncLog-estado_sync-2"
            name="estado_sync"
            defaultValue="ERROR"
            defaultChecked={props.endpointSyncLog?.estado_sync?.includes(
              'ERROR'
            )}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />

          <div>Error</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="endpointSyncLog-estado_sync-3"
            name="estado_sync"
            defaultValue="PARCIAL"
            defaultChecked={props.endpointSyncLog?.estado_sync?.includes(
              'PARCIAL'
            )}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />

          <div>Parcial</div>
        </div>

        <FieldError name="estado_sync" className="rw-field-error" />

        <Label
          name="trigger"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Trigger
        </Label>

        <div className="rw-check-radio-items">
          <RadioField
            id="endpointSyncLog-trigger-0"
            name="trigger"
            defaultValue="MANUAL"
            defaultChecked={props.endpointSyncLog?.trigger?.includes('MANUAL')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />

          <div>Manual</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="endpointSyncLog-trigger-1"
            name="trigger"
            defaultValue="CRON"
            defaultChecked={props.endpointSyncLog?.trigger?.includes('CRON')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />

          <div>Cron</div>
        </div>

        <FieldError name="trigger" className="rw-field-error" />

        <Label
          name="mensaje"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Mensaje
        </Label>

        <TextField
          name="mensaje"
          defaultValue={props.endpointSyncLog?.mensaje}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="mensaje" className="rw-field-error" />

        <Label
          name="error_detalle"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Error detalle
        </Label>

        <TextField
          name="error_detalle"
          defaultValue={props.endpointSyncLog?.error_detalle}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="error_detalle" className="rw-field-error" />

        <Label
          name="snapshot_resultado"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Snapshot resultado
        </Label>

        <TextAreaField
          name="snapshot_resultado"
          defaultValue={JSON.stringify(
            props.endpointSyncLog?.snapshot_resultado
          )}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ valueAsJSON: true }}
        />

        <FieldError name="snapshot_resultado" className="rw-field-error" />

        <Label
          name="total_clusters"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Total clusters
        </Label>

        <NumberField
          name="total_clusters"
          defaultValue={props.endpointSyncLog?.total_clusters}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="total_clusters" className="rw-field-error" />

        <Label
          name="total_servidores"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Total servidores
        </Label>

        <NumberField
          name="total_servidores"
          defaultValue={props.endpointSyncLog?.total_servidores}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="total_servidores" className="rw-field-error" />

        <Label
          name="total_maquinas"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Total maquinas
        </Label>

        <NumberField
          name="total_maquinas"
          defaultValue={props.endpointSyncLog?.total_maquinas}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="total_maquinas" className="rw-field-error" />

        <Label
          name="total_nodos"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Total nodos
        </Label>

        <NumberField
          name="total_nodos"
          defaultValue={props.endpointSyncLog?.total_nodos}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="total_nodos" className="rw-field-error" />

        <Label
          name="fecha_inicio"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Fecha inicio
        </Label>

        <DatetimeLocalField
          name="fecha_inicio"
          defaultValue={formatDatetime(props.endpointSyncLog?.fecha_inicio)}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="fecha_inicio" className="rw-field-error" />

        <Label
          name="fecha_fin"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Fecha fin
        </Label>

        <DatetimeLocalField
          name="fecha_fin"
          defaultValue={formatDatetime(props.endpointSyncLog?.fecha_fin)}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="fecha_fin" className="rw-field-error" />

        <Label
          name="duracion_ms"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Duracion ms
        </Label>

        <NumberField
          name="duracion_ms"
          defaultValue={props.endpointSyncLog?.duracion_ms}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="duracion_ms" className="rw-field-error" />

        <Label
          name="estado"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Estado
        </Label>

        <div className="rw-check-radio-items">
          <RadioField
            id="endpointSyncLog-estado-0"
            name="estado"
            defaultValue="ACTIVO"
            defaultChecked={props.endpointSyncLog?.estado?.includes('ACTIVO')}
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />

          <div>Activo</div>
        </div>

        <div className="rw-check-radio-items">
          <RadioField
            id="endpointSyncLog-estado-1"
            name="estado"
            defaultValue="INACTIVO"
            defaultChecked={props.endpointSyncLog?.estado?.includes('INACTIVO')}
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
          defaultValue={props.endpointSyncLog?.usuario_creacion}
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
            props.endpointSyncLog?.fecha_modificacion
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
          defaultValue={props.endpointSyncLog?.usuario_modificacion}
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

export default EndpointSyncLogForm
