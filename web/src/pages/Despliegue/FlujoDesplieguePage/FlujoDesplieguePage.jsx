import { useState } from 'react'

import Select from 'react-select'

import {
  Form,
  FormError,
  FieldError,
  Label,
  SelectField,
  DatetimeLocalField,
  TextField,
  Submit,
} from '@redwoodjs/forms'
import { useQuery } from '@redwoodjs/web'

const OBTENER_MAQUINAS = gql`
  query ObtenerMaquinaDespliegue {
    maquinas {
      id
      nombre
      estado
    }
  }
`
const OBTENER_COMPONENTES = gql`
  query ObtenerComponentesDespliegue {
    componentes {
      id
      nombre
      estado
    }
  }
`
const GET_PARAMETROS = gql`
  query GetParametrosDespliegue {
    parametros {
      id
      codigo
      nombre
      grupo
      estado
    }
  }
`
const formatDatetime = (value) => {
  if (value) {
    return value.replace(/:\d{2}\.\d{3}\w/, '')
  }
}

const DespliegueForm = (props) => {
  const { data: componentesData } = useQuery(OBTENER_COMPONENTES)
  const { data: maquinasData } = useQuery(OBTENER_MAQUINAS)
  const { data: parametrosData } = useQuery(GET_PARAMETROS)

  const parametrosDeTipoRespaldo = parametrosData?.parametros.filter(
    (param) => {
      return param.grupo === 'TIPO_RESPALDO'
    }
  )
  const parametrosDeEstadoDespliegue = parametrosData?.parametros.filter(
    (param) => {
      return param.grupo === 'E_EVENTO_DESPLIEGUE'
    }
  )

  const [selectedComponente, setSelectedComponente] = useState(
    props.asignacionServidorMaquina?.id_servidor || null
  )
  const [selectedMaquina, setSelectedMaquina] = useState(
    props.asignacionServidorMaquina?.id_maquina || null
  )

  const componentesOptions =
    componentesData?.componentes
      ?.filter((componente) => componente.estado === 'ACTIVO')
      .map((componente) => ({
        value: componente.id,
        label: componente.nombre,
      })) || []

  const maquinasOptions =
    maquinasData?.maquinas
      ?.filter((maquina) => maquina.estado === 'ACTIVO')
      .map((maquina) => ({
        value: maquina.id,
        label: maquina.nombre,
      })) || []

  const onSubmit = (data) => {
    const formData = {
      ...data,
      id_componente: selectedComponente,
      id_maquina: selectedMaquina,
      cod_tipo_respaldo: data.cod_tipo_respaldo,
      estado_despliegue: data.estado_despliegue,
      estado: 'ACTIVO',
      usuario_modificacion: 1,
      usuario_creacion: 1,
    }
    props.onSave(formData, props?.despliegue?.id)
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

        <Label className="input-label">Componente</Label>
        <Select
          name="id_componente"
          value={
            componentesOptions.find(
              (option) => option.value === selectedComponente
            ) || ''
          }
          options={componentesOptions}
          onChange={(selectedOption) =>
            setSelectedComponente(selectedOption?.value || null)
          }
          className="input-field select-field"
          isClearable
          placeholder="Buscar y seleccionar un componente..."
        />

        <Label className="input-label">Maquina</Label>
        <Select
          name="id_maquina"
          value={
            maquinasOptions.find(
              (option) => option.value === selectedMaquina
            ) || ''
          }
          options={maquinasOptions}
          onChange={(selectedOption) =>
            setSelectedMaquina(selectedOption?.value || null)
          }
          className="input-field select-field"
          isClearable
          placeholder="Buscar y seleccionar una maquina..."
        />

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

        <Label className="input-label">Tipo de Respaldo</Label>
        <SelectField
          name="cod_tipo_respaldo"
          defaultValue={props.despliegue?.cod_tipo_respaldo || ''}
          className="input-field select-field"
        >
          <option value="">Seleccionar Tipo Respaldo...</option>
          {parametrosDeTipoRespaldo?.map((respaldo) => (
            <option key={respaldo.id} value={respaldo.codigo}>
              {respaldo.nombre}
            </option>
          ))}
        </SelectField>

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

        <Label className="input-label">Estado despliegue</Label>
        <SelectField
          name="estado_despliegue"
          defaultValue={props.despliegue?.estado_despliegue || ''}
          className="input-field select-field"
        >
          <option value="">Seleccionar Estado Despliegu...</option>
          {parametrosDeEstadoDespliegue?.map((estadoDespliegue) => (
            <option key={estadoDespliegue.id} value={estadoDespliegue.codigo}>
              {estadoDespliegue.nombre}
            </option>
          ))}
        </SelectField>

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
