import { useState } from 'react'

import Select from 'react-select'

import {
  Form,
  FormError,
  FieldError,
  Label,
  NumberField,
  Submit,
  TextField,
  SelectField,
} from '@redwoodjs/forms'
import { useQuery } from '@redwoodjs/web'

const GET_HARDWARE = gql`
  query GetHardwareServidor {
    hardwares {
      id
      serie
      marca
      modelo
      estado
    }
  }
`
const GET_PARAMETROS = gql`
  query GetParametrosServidor {
    parametros {
      id
      codigo
      nombre
      grupo
    }
  }
`

const ServidorForm = (props) => {
  const { data: hardwareData } = useQuery(GET_HARDWARE)
  const { data: parametrosData } = useQuery(GET_PARAMETROS)
  const [selectedHardware, setSelectedHardware] = useState(
    props.servidor?.id_hardware || null
  )

  const parametrosDeEstadoOperativo = parametrosData?.parametros.filter(
    (param) => param.grupo === 'ESTADO_OPERATIVO'
  )
  const hardwareOptions =
    hardwareData?.hardwares
      ?.filter((hardware) => hardware.estado === 'ACTIVO')
      .map((hardware) => ({
        value: hardware.id,
        label:
          hardware.serie + ' - ' + hardware.marca + ' - ' + hardware.modelo,
      })) || []
  const onSubmit = (data) => {
    const formData = {
      ...data,
      id_hardware: selectedHardware,
      estado_operativo: data.estado_operativo,
      estado: 'ACTIVO',
      usuario_modificacion: 2,
      usuario_creacion: 3,
    }
    props.onSave(formData, props?.servidor?.id)
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

        <Label className="input-label">Hardware</Label>
        <Select
          name="id_hardware"
          value={
            hardwareOptions.find(
              (option) => option.value === selectedHardware
            ) || ''
          }
          options={hardwareOptions}
          onChange={(selectedOption) =>
            setSelectedHardware(selectedOption?.value || null)
          }
          className="input-field select-field"
          isClearable
          placeholder="Buscar y seleccionar un hardware..."
        />

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

        <Label className="input-label">Codigo Inventario Agetic</Label>
        <TextField
          name="cod_inventario_agetic"
          defaultValue={props.servidor?.cod_inventario_agetic}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

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

        <Label className="input-label">Estado Operativo</Label>
        <SelectField
          name="estado_operativo"
          defaultValue={props.servidor?.estado_operativo || ''}
          className="input-field select-field"
        >
          <option value="">Seleccionar...</option>
          {parametrosDeEstadoOperativo?.map((estadoOperativo) => (
            <option key={estadoOperativo.id} value={estadoOperativo.codigo}>
              {estadoOperativo.nombre}
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

export default ServidorForm
