import {
  Form,
  FormError,
  FieldError,
  Label,
  NumberField,
  TextField,
  TextAreaField,
  SelectField,
  Submit,
} from '@redwoodjs/forms'
import { useQuery } from '@redwoodjs/web'
const GET_PARAMETROS = gql`
  query GetParametrosMaquinas {
    parametros {
      id
      codigo
      nombre
      grupo
    }
  }
`
const MaquinaForm = (props) => {
  const { data: parametrosData } = useQuery(GET_PARAMETROS)

  const parametrosDeTipoMaquina = parametrosData?.parametros.filter(
    (param) => param.grupo === 'TIPO_MAQUINA'
  )

  const onSubmit = (data) => {
    const formData = {
      ...data,
      cod_tipo_maquina: data.cod_tipo_maquina,
      estado: 'ACTIVO',
      usuario_modificacion: 2,
      usuario_creacion: 3,
    }
    props.onSave(formData, props?.maquina?.id)
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

        <Label className="input-label">Tipo de Maquina</Label>
        <SelectField
          name="cod_tipo_maquina"
          defaultValue={props.maquina?.cod_tipo_maquina || ''}
          className="input-field select-field"
        >
          <option value="">Seleccionar...</option>
          {parametrosDeTipoMaquina?.map((tipoMaquina) => (
            <option key={tipoMaquina.id} value={tipoMaquina.codigo}>
              {tipoMaquina.nombre}
            </option>
          ))}
        </SelectField>
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
          IP
        </Label>

        <input
          list="ip-subnets"
          name="ip"
          defaultValue={props.maquina?.ip}
          className="rw-input"
          required
        />

        <datalist id="ip-subnets">
          <option value="192.168.0." />
          <option value="192.168.1." />
          <option value="10.0.0." />
          <option value="172.16.0." />
        </datalist>

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
