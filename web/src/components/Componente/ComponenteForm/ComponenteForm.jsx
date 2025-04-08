import { useState } from 'react'

import Select from 'react-select'

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
const OBTENER_SISTEMAS = gql`
  query ObtenerSistemas {
    sistemas {
      id
      nombre
      estado
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
      {['tecnology', 'version'].map((field) => (
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

const ComponenteForm = (props) => {
  const { data: sistemasData } = useQuery(OBTENER_SISTEMAS)
  const { data: parametrosData } = useQuery(GET_PARAMETROS)
  const [selectedSistema, setSelectedSistema] = useState(
    props.evento?.id_padre || null
  )
  const parametrosDeEntorno = parametrosData?.parametros.filter((param) => {
    return param.grupo === 'ENTORNO'
  })
  const parametrosDeCategoria = parametrosData?.parametros.filter(
    (param) => param.grupo === 'CATEGORIA'
  )

  const [respaldoData, setRespaldoData] = useState({
    tecnology: '',
    version: '',
  })
  // Opciones de React Select
  const sistemasOptions =
    sistemasData?.sistemas
      ?.filter((sistema) => sistema.estado === 'ACTIVO')
      .map((sistema) => ({
        value: sistema.id,
        label: sistema.nombre,
      })) || []
  // Enviar datos
  const onSubmit = (data) => {
    const formData = {
      ...data,
      id_sistema: selectedSistema,
      cod_entorno: data.cod_entorno,
      cod_categoria: data.cod_categoria,
      estado: 'ACTIVO',
      tecnologia: respaldoData,
      usuario_modificacion: 2,
      usuario_creacion: 3,
    }
    props.onSave(formData, props?.componente?.id)
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
        <Select
          name="id_sistema"
          value={
            sistemasOptions.find(
              (option) => option.value === selectedSistema
            ) || ''
          }
          options={sistemasOptions}
          onChange={(selectedOption) =>
            setSelectedSistema(selectedOption?.value || null)
          }
          className="input-field select-field"
          isClearable
          placeholder="Buscar y seleccionar un sistema..."
        />

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
            <option key={entorno.id} value={entorno.codigo}>
              {entorno.nombre}
            </option>
          ))}
        </SelectField>

        <Label className="input-label">Categoria</Label>
        <SelectField
          name="cod_categoria"
          defaultValue={props.componente?.cod_categoria || ''}
          className="input-field select-field"
        >
          <option value="">Seleccionar Categoria...</option>
          {parametrosDeCategoria?.map((categoria) => (
            <option key={categoria.id} value={categoria.codigo}>
              {categoria.nombre}
            </option>
          ))}
        </SelectField>

        <Label
          name="gitlab_repo"
          className="rw-label"
          errorClassName="rw-label rw-label-error"
        >
          Gitlab repoositorio
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
