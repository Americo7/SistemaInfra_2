import { useState } from 'react'

import {
  Form,
  FormError,
  FieldError,
  Label,
  SelectField,
  TextField,
  RadioField,
  Submit,
} from '@redwoodjs/forms'
import { useQuery } from '@redwoodjs/web'
const OBTENER_SISTEMAS = gql`
  query ObtenerSistemas {
    sistemas {
      id
      nombre
    }
  }
`
const GET_PARAMETROS = gql`
  query GetParametros {
    parametros {
      id
      codigo
      nombre
      grupo
    }
  }
`
const RespaldoField = ({ defaultValue, onRespaldoChange }) => {
  const [respaldoData, setRespaldoData] = useState(
    defaultValue || {
      tecnologia: '',
      version: '',
    }
  )

  const handleChange = (event) => {
    const { name, value } = event.target
    const newData = { ...respaldoData, [name]: value }
    setRespaldoData(newData)
    onRespaldoChange(newData)
  }

  return (
    <div className="respaldo-section">
      <div className="form-grid">
        <div className="form-group">
          <Label className="input-label">Tecnología</Label>
          <TextField
            value={respaldoData.tecnologia}
            onChange={handleChange}
            name="tecnologia"
            className="input-field"
            placeholder=""
          />
        </div>

        <div className="form-group">
          <Label className="input-label">Version</Label>
          <TextField
            value={respaldoData.version}
            onChange={handleChange}
            name="version"
            className="input-field"
            placeholder=""
          />
        </div>
      </div>
    </div>
  )
}

const ComponenteForm = (props) => {
  const { data: sistemasData } = useQuery(OBTENER_SISTEMAS)
  const { data: parametrosData } = useQuery(GET_PARAMETROS)

  const parametrosDeEntorno = parametrosData?.parametros.filter((param) => {
    return param.grupo === 'ENTORNO'
  })

  const parametrosDeCategoria = parametrosData?.parametros.filter(
    (param) => param.grupo === 'CATEGORIA'
  )

  const [respaldoData, setRespaldoData] = useState({
    tecnologia: '',
    version: '',
  })
  const [setFormData] = useState({
    nombre: '',
    dominio: '',
    descripcion: '',
  })
  // Función para validar que el campo no contenga números
  const validateNoNumbers = (value) => {
    const regex = /\d/ // Expresión regular que busca números
    return !regex.test(value)
  }

  // Manejador de cambio para los campos de texto con validación
  const handleTextChange = (event) => {
    const { name, value } = event.target
    if (validateNoNumbers(value)) {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }))
    } else {
      alert('No se pueden ingresar números en este campo')
    }
  }
  // Enviar datos
  const onSubmit = (data) => {
    props.onSave(data, props?.componente?.id)
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

        <Label className="input-label">Sistema</Label>
        <SelectField
          name="id_sistema"
          defaultValue={props.componente?.id_sistema || ''}
          className="input-field select-field"
        >
          <option value="">Seleccionar sistema...</option>
          {sistemasData?.sistemas.map((sistema) => (
            <option key={sistema.id} value={sistema.id}>
              {sistema.nombre}
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
          defaultValue={props.componente?.nombre}
          onChange={handleTextChange}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="nombre" className="rw-field-error" />

        <Label
          name="dominio"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Dominio
        </Label>

        <TextField
          name="dominio"
          defaultValue={props.componente?.dominio}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="dominio" className="rw-field-error" />

        <Label
          name="descripcion"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Descripcion
        </Label>

        <TextField
          name="descripcion"
          defaultValue={props.componente?.descripcion}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
          validation={{ required: true }}
        />

        <FieldError name="descripcion" className="rw-field-error" />

        <Label className="input-label">Entorno</Label>
        <SelectField
          name="cod_entorno"
          defaultValue={props.componente?.cod_entorno || ''}
          className="input-field select-field"
        >
          <option value="">Seleccionar Entorno...</option>
          {parametrosDeEntorno?.map((entorno) => (
            <option key={entorno.id} value={entorno.id}>
              {entorno.codigo}
            </option>
          ))}
        </SelectField>

        <Label className="input-label">Entorno</Label>
        <SelectField
          name="cod_categoria"
          defaultValue={props.componente?.cod_categoria || ''}
          className="input-field select-field"
        >
          <option value="">Seleccionar Categoria...</option>
          {parametrosDeCategoria?.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.codigo}
            </option>
          ))}
        </SelectField>

        <Label
          name="gitlab_repo"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Gitlab repo
        </Label>

        <TextField
          name="gitlab_repo"
          defaultValue={props.componente?.gitlab_repo}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="gitlab_repo" className="rw-field-error" />

        <Label
          name="gitlab_rama"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Gitlab rama
        </Label>

        <TextField
          name="gitlab_rama"
          defaultValue={props.componente?.gitlab_rama}
          className="rw-input"
          errorClassName="rw-input rw-input-error"
        />

        <FieldError name="gitlab_rama" className="rw-field-error" />

        <RespaldoField
          defaultValue={respaldoData}
          onRespaldoChange={setRespaldoData}
        />

        <Label
          name="estado"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Estado
        </Label>
        <div className="rw-check-radio-items">
          <RadioField
            id="componente-estado-0"
            name="estado"
            defaultValue="ACTIVO"
            defaultChecked={
              props.componente?.estado
                ? props.componente.estado.includes('ACTIVO')
                : true
            }
            className="rw-input"
            errorClassName="rw-input rw-input-error"
          />
          <div>Activo</div>
        </div>
        <FieldError name="estado" className="rw-field-error" />

        <div className="rw-button-group">
          <Submit disabled={props.loading} className="rw-button rw-button-blue">
            Save
          </Submit>
        </div>
      </Form>
    </div>
  )
}

export default ComponenteForm
