import { useState, useEffect } from 'react'
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

  const selected = options.filter((opt) => value?.includes(opt.value))

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
  const { data: usuariosData, loading: loadingUsuarios } = useQuery(GET_USUARIOS)
  const { data: parametrosData, loading: loadingParametros } = useQuery(GET_PARAMETROS)
  const [responsablesSeleccionados, setResponsablesSeleccionados] = useState(
    props.evento?.responsables || []
  )
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!loadingUsuarios && !loadingParametros && props.evento && !isInitialized) {
      setResponsablesSeleccionados(props.evento.responsables || [])
      setIsInitialized(true)
    }
  }, [loadingUsuarios, loadingParametros, props.evento, isInitialized])

  const parametrosDeTipoEvento = parametrosData?.parametros?.filter((param) => {
    return param.grupo === 'TIPO_EVENTO'
  }) || []

  const parametrosDeEstadoEvento = parametrosData?.parametros?.filter(
    (param) => param.grupo === 'E_EVENTO_DESPLIEGUE'
  ) || []

  const onSubmit = (data) => {
    const formData = {
      ...data,
      cod_tipo_evento: data.cod_tipo_evento,
      responsables: responsablesSeleccionados,
      estado: 'ACTIVO',
      usuario_modificacion: 2,
      usuario_creacion: 3,
    }
    props.onSave(formData, props?.evento?.id)
  }

  if (loadingUsuarios || loadingParametros) {
    return <div>Cargando datos...</div>
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
          defaultValue={props.evento?.cod_tipo_evento}
          className="input-field select-field"
          validation={{ required: true }}
        >
          <option value="">Seleccionar Tipo Evento...</option>
          {parametrosDeTipoEvento.map((tipoEvento) => (
            <option
              key={tipoEvento.id}
              value={tipoEvento.codigo}
              selected={props.evento?.cod_tipo_evento === tipoEvento.codigo}
            >
              {tipoEvento.nombre}
            </option>
          ))}
        </SelectField>
        <FieldError name="cod_tipo_evento" className="rw-field-error" />

        <Label
          name="descripcion"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Descripción
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
          defaultValue={props.evento?.estado_evento}
          className="input-field select-field"
          validation={{ required: true }}
        >
          <option value="">Seleccionar Estado de Evento...</option>
          {parametrosDeEstadoEvento.map((estadoEvento) => (
            <option
              key={estadoEvento.id}
              value={estadoEvento.codigo}
              selected={props.evento?.estado_evento === estadoEvento.codigo}
            >
              {estadoEvento.nombre}
            </option>
          ))}
        </SelectField>
        <FieldError name="estado_evento" className="rw-field-error" />

        <Label
          name="cite"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Cite
        </Label>
        <TextField
          name="cite"
          defaultValue={props.evento?.cite}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />
        <FieldError name="cite" className="rw-field-error" />

        <Label
          name="solicitante"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Solicitante
        </Label>
        <TextField
          name="solicitante"
          defaultValue={props.evento?.solicitante}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />
        <FieldError name="solicitante" className="rw-field-error" />

        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Guardar
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default EventoForm
