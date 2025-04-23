import { createTheme } from '@mui/material/styles';

const burgundyTheme = createTheme({
  palette: {
    primary: {
      main: '#6B2737',  // Guindo intenso
      light: '#8F4A5B', // Versión más clara
      dark: '#4A1A25',  // Versión más oscura
      contrastText: '#FFFFFF' // Texto blanco para contraste
    },
    secondary: {
      main: '#E0A96D', // Dorado/beige para complementar
      contrastText: '#2A2A2A'
    },
    background: {
      default: '#F8F5F2' // Fondo claro beige
    }
  },
  typography: {
    fontFamily: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'sans-serif'
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          padding: '12px 24px'
        }
      }
    }
  }
});

export default burgundyTheme;
