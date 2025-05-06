import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
  useTheme,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  Form,
  FormError,
  FieldError,
  Label,
  TextField as RedwoodTextField,
} from '@redwoodjs/forms';
import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material';
import { useAuth } from 'src/auth'

const EntidadForm = (props) => {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const onSubmit = (data) => {
    const formData = {
      ...data,
      estado: 'ACTIVO',
      usuario_modificacion: currentUser?.id, // ID del usuario actual
      usuario_creacion: props.entidad?.id ? props.entidad.usuario_creacion : currentUser?.id, // Si es edición, mantiene el usuario de creación original
    };
    props.onSave(formData, props?.entidad?.id);
  };

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
          {props.entidad?.id ? 'Editar Entidad' : 'Nueva Entidad'}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Complete todos los campos requeridos
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
            <Grid item xs={12} md={4}>
              <Label
                name="codigo"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: theme.palette.text.primary,
                  fontSize: '0.875rem',
                }}
              >
                Código
              </Label>
              <RedwoodTextField
                name="codigo"
                defaultValue={props.entidad?.codigo}
                validation={{ required: 'El código es requerido' }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.divider}`,
                  fontSize: '0.9375rem',
                  transition: 'all 0.2s ease',
                  '&:focus': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
                  },
                }}
                errorStyle={{
                  borderColor: theme.palette.error.main,
                  backgroundColor: theme.palette.error.lighter,
                }}
              />
              <FieldError
                name="codigo"
                style={{
                  color: theme.palette.error.main,
                  fontSize: '0.75rem',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Label
                name="sigla"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: theme.palette.text.primary,
                  fontSize: '0.875rem',
                }}
              >
                Sigla
              </Label>
              <RedwoodTextField
                name="sigla"
                defaultValue={props.entidad?.sigla}
                validation={{ required: 'La sigla es requerida' }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.divider}`,
                  fontSize: '0.9375rem',
                  transition: 'all 0.2s ease',
                }}
                errorStyle={{
                  borderColor: theme.palette.error.main,
                  backgroundColor: theme.palette.error.lighter,
                }}
              />
              <FieldError
                name="sigla"
                style={{
                  color: theme.palette.error.main,
                  fontSize: '0.75rem',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Label
                name="nombre"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: theme.palette.text.primary,
                  fontSize: '0.875rem',
                }}
              >
                Nombre completo
              </Label>
              <RedwoodTextField
                name="nombre"
                defaultValue={props.entidad?.nombre}
                validation={{ required: 'El nombre es requerido' }}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.palette.divider}`,
                  fontSize: '0.9375rem',
                  transition: 'all 0.2s ease',
                }}
                errorStyle={{
                  borderColor: theme.palette.error.main,
                  backgroundColor: theme.palette.error.lighter,
                }}
              />
              <FieldError
                name="nombre"
                style={{
                  color: theme.palette.error.main,
                  fontSize: '0.75rem',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              />
            </Grid>
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
              startIcon={
                props.loading ? null : (
                  <CheckCircleOutline fontSize="small" />
                )
              }
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
              {props.loading ? 'Guardando...' : 'Guardar Entidad'}
            </LoadingButton>
          </Box>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EntidadForm;
