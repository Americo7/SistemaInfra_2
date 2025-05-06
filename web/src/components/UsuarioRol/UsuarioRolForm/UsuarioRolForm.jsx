import { useState, useEffect } from 'react'
import Select from 'react-select'
import { Form, FormError, Label } from '@redwoodjs/forms'
import { useQuery } from '@redwoodjs/web'
import { useAuth } from 'src/auth'
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
  useTheme,
  IconButton,
  TextField,
  List,
  ListItem,
  Checkbox,
  ListItemIcon,
  ListItemText,
  Chip,
  Fade,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import {
  CheckCircleOutline,
  HelpOutline,
  Person,
  Badge,
  Computer,
  Apps,
  Close,
} from '@mui/icons-material'

const GET_USUARIOS = gql`
  query ObtenerUsuariosAsignacion {
    usuarios {
      id
      nombres
      primer_apellido
      segundo_apellido
      estado
    }
  }
`

const GET_ROLES = gql`
  query ObtenerRolesAsignacion {
    roles {
      id
      nombre
      estado
    }
  }
`

const GET_MAQUINAS = gql`
  query GetMaquinasAsignacion {
    maquinas {
      id
      nombre
      ip
      estado
    }
  }
`

const GET_SISTEMAS = gql`
  query GetSistemasAsignacion {
    sistemas {
      id
      nombre
      estado
    }
  }
`

const UsuarioRolForm = (props) => {
  const theme = useTheme()
  const { currentUser } = useAuth()
  const { data: usuariosData } = useQuery(GET_USUARIOS)
  const { data: rolesData } = useQuery(GET_ROLES)
  const { data: maquinasData } = useQuery(GET_MAQUINAS)
  const { data: sistemasData } = useQuery(GET_SISTEMAS)

  const [selectedUsuario, setSelectedUsuario] = useState(props.usuarioRol?.id_usuario || null)
  const [selectedRol, setSelectedRol] = useState(props.usuarioRol?.id_rol || null)
  const [selectedMaquinas, setSelectedMaquinas] = useState([])
  const [selectedSistema, setSelectedSistema] = useState(props.usuarioRol?.id_sistema || null)
  const [searchMaquina, setSearchMaquina] = useState('')
  const [showMaquinas, setShowMaquinas] = useState(false)
  const [showSistemas, setShowSistemas] = useState(false)
  const [searchUsuario, setSearchUsuario] = useState('')

  // Initialize selected machines when editing
  useEffect(() => {
    if (props.usuarioRol && props.usuarioRol.id_maquina) {
      setSelectedMaquinas([props.usuarioRol.id_maquina])
    } else if (props.usuarioRol && props.usuarioRol.maquinas && props.usuarioRol.maquinas.length > 0) {
      const maquinaIds = props.usuarioRol.maquinas.map(m => m.id)
      setSelectedMaquinas(maquinaIds)
    }
  }, [props.usuarioRol])

  // Efecto para mostrar/ocultar campos según el rol seleccionado
  useEffect(() => {
    if (selectedRol) {
      const rolSeleccionado = rolesData?.roles?.find(rol => rol.id === selectedRol)
      if (rolSeleccionado?.nombre === 'SI - Admin') {
        setShowSistemas(true)
        setShowMaquinas(false)
      } else {
        setShowMaquinas(true)
        setShowSistemas(false)
        // Solo limpiar sistema si cambiamos de Admin SI a otro rol
        if (!showMaquinas) {
          setSelectedSistema(null)
        }
      }
    } else {
      // Si no hay rol seleccionado, ocultar ambos campos
      setShowMaquinas(false)
      setShowSistemas(false)
    }
  }, [selectedRol, rolesData?.roles])

  const usuarioOptions =
    usuariosData?.usuarios
      ?.filter((usuario) => usuario.estado === 'ACTIVO')
      .sort((a, b) => {
        // Ordenar por apellido y luego por nombre
        const apellidoA = `${a.primer_apellido} ${a.segundo_apellido || ''}`.trim().toLowerCase();
        const apellidoB = `${b.primer_apellido} ${b.segundo_apellido || ''}`.trim().toLowerCase();

        if (apellidoA < apellidoB) return -1;
        if (apellidoA > apellidoB) return 1;

        // Si los apellidos son iguales, ordenar por nombre
        return a.nombres.toLowerCase() < b.nombres.toLowerCase() ? -1 : 1;
      })
      .map((usuario) => ({
        value: usuario.id,
        label: `${usuario.primer_apellido} ${usuario.segundo_apellido || ''}, ${usuario.nombres}`,
        searchTerms: `${usuario.nombres} ${usuario.primer_apellido} ${usuario.segundo_apellido || ''}`.toLowerCase(),
      })) || []

  const rolOptions =
    rolesData?.roles
      ?.filter((rol) => rol.estado === 'ACTIVO')
      .sort((a, b) => a.nombre.localeCompare(b.nombre)) // Ordenar roles alfabéticamente
      .map((rol) => ({
        value: rol.id,
        label: rol.nombre,
      })) || []

  const maquinasList =
    maquinasData?.maquinas
      ?.filter((maquina) => maquina.estado === 'ACTIVO')
      .sort((a, b) => a.nombre.localeCompare(b.nombre)) || [] // Ordenar máquinas alfabéticamente

  const filteredMaquinas = maquinasList.filter(maquina =>
    maquina.nombre.toLowerCase().includes(searchMaquina.toLowerCase()) ||
    maquina.ip.includes(searchMaquina)
  )

  const sistemasOptions =
    sistemasData?.sistemas
      ?.filter((sistema) => sistema.estado === 'ACTIVO')
      .sort((a, b) => a.nombre.localeCompare(b.nombre)) // Ordenar sistemas alfabéticamente
      .map((sistema) => ({
        value: sistema.id,
        label: sistema.nombre,
      })) || []

  const handleToggleMaquina = (maquinaId) => {
    const currentIndex = selectedMaquinas.indexOf(maquinaId)
    const newSelected = [...selectedMaquinas]

    if (currentIndex === -1) {
      newSelected.push(maquinaId)
    } else {
      newSelected.splice(currentIndex, 1)
    }

    setSelectedMaquinas(newSelected)
  }

  const handleRemoveMaquina = (maquinaId, e) => {
    e.stopPropagation()
    setSelectedMaquinas(selectedMaquinas.filter(id => id !== maquinaId))
  }

  const onSubmit = (data) => {
    // Validar campos requeridos (solo usuario y rol)
    if (!selectedUsuario || !selectedRol) {
      alert('Por favor complete los campos obligatorios: Usuario y Rol')
      return
    }

    // Determinar qué campos incluir según el rol
    const rolSeleccionado = rolesData?.roles?.find(rol => rol.id === selectedRol)
    const esAdminSI = rolSeleccionado?.nombre === 'SI - Admin'

    // Si es admin SI, crear una sola asignación con sistema
    if (esAdminSI) {
      const asignacion = {
        ...data,
        id_usuario: selectedUsuario,
        id_rol: selectedRol,
        id_maquina: null,
        id_sistema: selectedSistema,
        estado: 'ACTIVO',
        usuario_creacion: props.usuarioRol?.id ? props.usuarioRol.usuario_creacion : currentUser?.id,
        usuario_modificacion: currentUser?.id
      }
      props.onSave(asignacion, props?.usuarioRol?.id)
      return
    }

    // Si no hay máquinas seleccionadas (y no es admin SI), crear una sola asignación sin máquina
    if (selectedMaquinas.length === 0 && !esAdminSI) {
      const asignacion = {
        ...data,
        id_usuario: selectedUsuario,
        id_rol: selectedRol,
        id_maquina: null,
        id_sistema: null,
        estado: 'ACTIVO',
        usuario_modificacion: 2,
        usuario_creacion: 3,
      }
      props.onSave(asignacion, props?.usuarioRol?.id)
      return
    }

    // Si hay máquinas seleccionadas, crear una asignación por cada máquina
    selectedMaquinas.forEach((id_maquina) => {
      const asignacion = {
        ...data,
        id_usuario: selectedUsuario,
        id_rol: selectedRol,
        id_maquina: id_maquina,
        id_sistema: null,
        estado: 'ACTIVO',
        usuario_modificacion: 2,
        usuario_creacion: 3,
      }
      props.onSave(asignacion, props?.usuarioRol?.id)
    })
  }

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '50px',
      borderRadius: '8px',
      borderColor: state.isFocused ? theme.palette.primary.main : theme.palette.divider,
      boxShadow: state.isFocused ? `0 0 0 1px ${theme.palette.primary.main}` : 'none',
      '&:hover': {
        borderColor: theme.palette.primary.main,
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? theme.palette.primary.light
        : state.isFocused
        ? theme.palette.action.hover
        : 'transparent',
      color: state.isSelected
        ? theme.palette.primary.contrastText
        : theme.palette.text.primary,
      padding: '10px 15px',
      fontSize: '14px',
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
      maxHeight: '300px',
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: '300px',
    }),
    input: (base) => ({
      ...base,
      fontSize: '14px',
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: '14px',
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: '14px',
    }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: '8px',
    }),
    clearIndicator: (base) => ({
      ...base,
      padding: '8px',
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '2px 8px',
    }),
  }

  return (
    <Card
      sx={{
        maxWidth: '900px',
        margin: 'auto',
        boxShadow: theme.shadows[6],
        borderRadius: '12px',
        overflow: 'visible',
      }}
    >
      <Box
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          p: 3,
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px',
          marginTop: '-1px',
        }}
      >
        <Typography variant="h5" fontWeight="600">
          {props.usuarioRol?.id ? 'Editar Asignación' : 'Nueva Asignación'}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Asignar roles, máquinas y sistemas a usuarios
        </Typography>
      </Box>

      <CardContent sx={{ p: 4 }}>
        <Form onSubmit={onSubmit} error={props.error}>
          <FormError
            error={props.error}
            wrapperStyle={{
              backgroundColor: theme.palette.error.light,
              color: theme.palette.error.contrastText,
              padding: '16px',
              marginBottom: '24px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            titleStyle={{
              fontWeight: '600',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            listStyle={{
              listStyleType: 'none',
              padding: 0,
              margin: 0,
            }}
          />

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Label
                name="id_usuario"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: theme.palette.text.primary,
                  fontSize: '0.875rem',
                }}
              >
                <Person fontSize="small" sx={{ mr: 1 }} />
                Usuario*
              </Label>
              <Select
                name="id_usuario"
                value={usuarioOptions.find((option) => option.value === selectedUsuario) || null}
                options={usuarioOptions}
                onChange={(selectedOption) => setSelectedUsuario(selectedOption?.value || null)}
                styles={customSelectStyles}
                classNamePrefix="select"
                isClearable
                placeholder="Seleccionar usuario..."
                noOptionsMessage={() => 'No hay usuarios disponibles'}
                required
                isSearchable={true}
                filterOption={(option, inputValue) =>
                  option.data.searchTerms.includes(inputValue.toLowerCase())
                }
                menuPortalTarget={document.body} // Para evitar problemas de z-index
                menuPlacement="auto" // Para posicionar el menú automáticamente
                maxMenuHeight={300}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Label
                name="id_rol"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: theme.palette.text.primary,
                  fontSize: '0.875rem',
                }}
              >
                <Badge fontSize="small" sx={{ mr: 1 }} />
                Rol*
              </Label>
              <Select
                name="id_rol"
                value={rolOptions.find((option) => option.value === selectedRol) || null}
                options={rolOptions}
                onChange={(selectedOption) => setSelectedRol(selectedOption?.value || null)}
                styles={customSelectStyles}
                classNamePrefix="select"
                isClearable
                placeholder="Seleccionar rol..."
                noOptionsMessage={() => 'No hay roles disponibles'}
                required
                isSearchable={true}
                menuPortalTarget={document.body}
                menuPlacement="auto"
                maxMenuHeight={300}
              />
            </Grid>

            <Fade in={showMaquinas} unmountOnExit>
              <Grid item xs={12} md={6}>
                <Label
                  name="id_maquinas"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: theme.palette.text.primary,
                    fontSize: '0.875rem',
                  }}
                >
                  <Computer fontSize="small" sx={{ mr: 1 }} />
                  Máquinas
                  <IconButton size="small" sx={{ ml: 0.5, color: 'text.secondary' }}>
                    <HelpOutline fontSize="small" />
                  </IconButton>
                </Label>

                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Buscar por nombre o IP..."
                  value={searchMaquina}
                  onChange={(e) => setSearchMaquina(e.target.value)}
                  sx={{ mb: 2 }}
                />

                {selectedMaquinas.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {selectedMaquinas.map(maquinaId => {
                      const maquina = maquinasList.find(m => m.id === maquinaId)
                      return (
                        <Chip
                          key={maquinaId}
                          label={`${maquina?.nombre || 'Cargando...'} ${maquina?.ip ? `(${maquina.ip})` : ''}`}
                          onDelete={(e) => handleRemoveMaquina(maquinaId, e)}
                          deleteIcon={<Close fontSize="small" />}
                          sx={{ backgroundColor: theme.palette.primary.light, color: theme.palette.primary.contrastText, mb: 1 }}
                        />
                      )
                    })}
                  </Box>
                )}

                <Card variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                  <List dense>
                    {filteredMaquinas.length > 0 ? (
                      filteredMaquinas.map((maquina) => (
                        <ListItem
                          key={maquina.id}
                          button
                          onClick={() => handleToggleMaquina(maquina.id)}
                          sx={{
                            '&:hover': {
                              backgroundColor: theme.palette.action.hover,
                            },
                            backgroundColor: selectedMaquinas.includes(maquina.id)
                              ? theme.palette.action.selected
                              : 'transparent',
                          }}
                        >
                          <ListItemIcon>
                            <Checkbox
                              edge="start"
                              checked={selectedMaquinas.includes(maquina.id)}
                              tabIndex={-1}
                              disableRipple
                              color="primary"
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={`${maquina.nombre} (${maquina.ip})`}
                            secondary={`ID: ${maquina.id}`}
                            primaryTypographyProps={{ fontWeight: selectedMaquinas.includes(maquina.id) ? '500' : '400' }}
                          />
                        </ListItem>
                      ))
                    ) : (
                      <ListItem>
                        <ListItemText
                          primary="No se encontraron máquinas"
                          secondary="Intente con otro término de búsqueda"
                          sx={{ textAlign: 'center', py: 2 }}
                        />
                      </ListItem>
                    )}
                  </List>
                </Card>
              </Grid>
            </Fade>

            <Fade in={showSistemas} unmountOnExit>
              <Grid item xs={12} md={6}>
                <Label
                  name="id_sistema"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: theme.palette.text.primary,
                    fontSize: '0.875rem',
                  }}
                >
                  <Apps fontSize="small" sx={{ mr: 1 }} />
                  Sistema
                  <IconButton size="small" sx={{ ml: 0.5, color: 'text.secondary' }}>
                    <HelpOutline fontSize="small" />
                  </IconButton>
                </Label>
                <Select
                  name="id_sistema"
                  value={sistemasOptions.find((option) => option.value === selectedSistema) || null}
                  options={sistemasOptions}
                  onChange={(selectedOption) => setSelectedSistema(selectedOption?.value || null)}
                  styles={customSelectStyles}
                  classNamePrefix="select"
                  isClearable
                  placeholder="Seleccionar sistema..."
                  noOptionsMessage={() => 'No hay sistemas disponibles'}
                  isSearchable={true}
                  menuPortalTarget={document.body}
                  menuPlacement="auto"
                  maxMenuHeight={300}
                />
              </Grid>
            </Fade>
          </Grid>

          <Divider sx={{ my: 4, borderColor: theme.palette.divider }} />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
            }}
          >
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={props.loading}
              loadingPosition="start"
              startIcon={props.loading ? null : <CheckCircleOutline fontSize="small" />}
              sx={{
                px: 5,
                py: 1.5,
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: '600',
                fontSize: '0.9375rem',
                boxShadow: theme.shadows[2],
                '&:hover': {
                  boxShadow: theme.shadows[4],
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              {props.loading ? 'Guardando...' : 'Guardar Asignación'}
            </LoadingButton>
          </Box>
        </Form>
      </CardContent>
    </Card>
  )
}

export default UsuarioRolForm
