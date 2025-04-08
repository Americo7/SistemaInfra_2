import { useState } from 'react'

import Select from 'react-select'

import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField,
  DatetimeLocalField,
  SelectField,
  Submit,
} from '@redwoodjs/forms'
import { useQuery } from '@redwoodjs/web'
const GET_PARAMETROS = gql`
  query GetParametrosTipoEvento {
    parametros {
      id
      codigo
      nombre
      grupo
    }
  }
`
const GET_USUARIOS = gql`
  query GetUsuariosEvento {
    usuarios {
      id
      nombres
      primer_apellido
      segundo_apellido
    }
  }
`

const RespaldoField = ({ defaultValue, onRespaldoChange }) => {
  const [respaldoData, setRespaldoData] = useState(
    defaultValue || { tecnology: '', version: '' }
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    const newData = { ...respaldoData, [name]: value }
    setRespaldoData(newData)
    onRespaldoChange(newData)
  }

  return (
    <div className="respaldo-section">
      {['servicios_afectados', 'comentarios'].map((field) => (
        <div key={field} className="form-group">
          <Label className="input-label">
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </Label>
          <TextField
            value={respaldoData[field]}
            onChange={handleChange}
            name={field}
            className="input-field"
          />
        </div>
      ))}
    </div>
  )
}

const formatDatetime = (value) => {
  if (value) {
    return value.replace(/:\d{2}\.\d{3}\w/, '')
  }
}

const ResponsablesSelect = ({ usuarios, value, onChange }) => {
  const options = usuarios.map((u) => ({
    value: u.id,
    label: `${u.nombres} ${u.primer_apellido} ${u.segundo_apellido}`,
  }))

  const selected = options.filter((opt) => value.includes(opt.value))

  return (
    <div className="mb-4">
      <Label className="rw-label">Responsables</Label>
      <Select
        isMulti
        options={options}
        value={selected}
        onChange={(selectedOptions) =>
          onChange(selectedOptions.map((opt) => opt.value))
        }
        className="basic-multi-select"
        classNamePrefix="select"
        placeholder="Buscar y seleccionar usuarios..."
      />
    </div>
  )
}

const EventoForm = (props) => {
  const { data: usuariosData } = useQuery(GET_USUARIOS)
  const { data: parametrosData } = useQuery(GET_PARAMETROS)
  const [responsablesSeleccionados, setResponsablesSeleccionados] = useState(
    props.evento?.responsables || []
  )

  const parametrosDeTipoEvento = parametrosData?.parametros.filter((param) => {
    return param.grupo === 'TIPO_EVENTO'
  })

  const parametrosDeEstadoEvento = parametrosData?.parametros.filter(
    (param) => param.grupo === 'E_EVENTO_DESPLIEGUE'
  )
  const [respaldoData, setRespaldoData] = useState({
    servicios_afectados: '',
    comentarios: '',
  })
  const onSubmit = (data) => {
    const formData = {
      ...data,
      cod_tipo_evento: data.cod_tipo_evento,
      responsables: responsablesSeleccionados,
      estado: 'ACTIVO',
      respaldo: respaldoData,
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

        <Label className="input-label">Tipo de Evento</Label>
        <SelectField
          name="cod_tipo_evento"
          defaultValue={props.componente?.cod_tipo_evento || ''}
          className="input-field select-field"
        >
          <option value="">Seleccionar Tipo Evento...</option>
          {parametrosDeTipoEvento?.map((tipoEvento) => (
            <option key={tipoEvento.id} value={tipoEvento.codigo}>
              {tipoEvento.nombre}
            </option>
          ))}
        </SelectField>

        <Label
          name="descripcion"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Descripcion
        </Label>

        <TextField
          name="descripcion"
          defaultValue={props.evento?.descripcion}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="descripcion" className="rw-field-error" />

        <Label
          name="fecha_evento"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Fecha evento
        </Label>

        <DatetimeLocalField
          name="fecha_evento"
          defaultValue={formatDatetime(props.evento?.fecha_evento)}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="fecha_evento" className="rw-field-error" />

        <ResponsablesSelect
          usuarios={usuariosData?.usuarios || []}
          value={responsablesSeleccionados}
          onChange={(ids) => setResponsablesSeleccionados(ids)}
        />

        <Label className="input-label">Estado de Evento</Label>
        <SelectField
          name="estado_evento"
          defaultValue={props.componente?.estado_evento || ''}
          className="input-field select-field"
        >
          <option value="">Seleccionar Estado de Evento...</option>
          {parametrosDeEstadoEvento?.map((estadoEvento) => (
            <option key={estadoEvento.id} value={estadoEvento.codigo}>
              {estadoEvento.nombre}
            </option>
          ))}
        </SelectField>
        <RespaldoField
          defaultValue={respaldoData}
          onRespaldoChange={setRespaldoData}
        />
        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Save
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default EventoForm
