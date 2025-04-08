import {
  Form,
  FormError,
  FieldError,
  Label,
  SelectField,
  TextField,
  Submit,
} from '@redwoodjs/forms'
import { useQuery } from '@redwoodjs/web'

const GET_PARAMETROS = gql`
  query GetParametrosHardware {
    parametros {
      id
      codigo
      nombre
      grupo
      estado
    }
  }
`

const OBTENER_DATA_CENTERS = gql`
  query ObtenerDataCentersHardware {
    dataCenters {
      id
      nombre
      estado
    }
  }
`

const HardwareForm = ({ hardware, onSave, error, loading }) => {
  const { data: dataCentersData } = useQuery(OBTENER_DATA_CENTERS)
  const { data: parametrosData } = useQuery(GET_PARAMETROS)

  const filtrarParametros = (grupo) =>
    parametrosData?.parametros.filter((p) => p.grupo === grupo) || []

  const opcionesParametros = (parametros) =>
    parametros.map((item) => (
      <option key={item.id} value={item.codigo}>
        {item.nombre}
      </option>
    ))

  const onSubmit = (data) => {
    const formData = {
      ...data,
      id_data_center: parseInt(data.id_data_center),
      cod_activo_agetic: data.cod_activo_agetic,
      cod_tipo_hw: data.cod_tipo_hw,
      estado_operativo: data.estado_operativo,
      estado: 'ACTIVO',
      usuario_modificacion: 2,
      usuario_creacion: 3,
    }
    onSave(formData, hardware?.id)
  }

  return (
    <div className="rw-form-wrapper">
      <Form onSubmit={onSubmit} error={error}>
        <FormError
          error={error}
          wrapperClassName="rw-form-error-wrapper"
          titleClassName="rw-form-error-title"
          listClassName="rw-form-error-list"
        />

        {/* Data Center */}
        <Label className="input-label">Data Center</Label>
        <SelectField
          name="id_data_center"
          defaultValue={String(hardware?.id_data_center || '')}
          className="input-field select-field"
        >
          <option value="">Seleccionar data center...</option>
          {dataCentersData?.dataCenters
            ?.filter((d) => d.estado === 'ACTIVO')
            .map((d) => (
              <option key={d.id} value={String(d.id)}>
                {d.nombre}
              </option>
            ))}
        </SelectField>

        {/* Serie */}
        <Label
          name="serie"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Serie
        </Label>
        <TextField
          name="serie"
          defaultValue={hardware?.serie}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />
        <FieldError name="serie" className="rw-field-error" />

        {/* Activo Agetic */}
        <Label className="input-label">Activo AGETIC</Label>
        <SelectField
          name="cod_activo_agetic"
          defaultValue={hardware?.cod_activo_agetic || ''}
          className="input-field select-field"
        >
          <option value="">Seleccionar...</option>
          {opcionesParametros(filtrarParametros('ACTIVO_AGETIC'))}
        </SelectField>

        {/* Tipo Hardware */}
        <Label className="input-label">Tipo Hardware</Label>
        <SelectField
          name="cod_tipo_hw"
          defaultValue={hardware?.cod_tipo_hw || ''}
          className="input-field select-field"
        >
          <option value="">Seleccionar...</option>
          {opcionesParametros(filtrarParametros('TIPO_HW'))}
        </SelectField>

        {/* Marca */}
        <Label
          name="marca"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Marca
        </Label>
        <TextField
          name="marca"
          defaultValue={hardware?.marca}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />
        <FieldError name="marca" className="rw-field-error" />

        {/* Modelo */}
        <Label
          name="modelo"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Modelo
        </Label>
        <TextField
          name="modelo"
          defaultValue={hardware?.modelo}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />
        <FieldError name="modelo" className="rw-field-error" />

        {/* Estado Operativo */}
        <Label className="input-label">Estado Operativo</Label>
        <SelectField
          name="estado_operativo"
          defaultValue={hardware?.estado_operativo || ''}
          className="input-field select-field"
        >
          <option value="">Seleccionar...</option>
          {opcionesParametros(filtrarParametros('ESTADO_OPERATIVO'))}
        </SelectField>

        {/* Botón */}
        <div className="rw-button-group">
          <Submit disabled={loading} className="rw-button rw-button-blue">
            Guardar
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default HardwareForm
