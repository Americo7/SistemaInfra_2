// web/src/theme/muiTheme.js
import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#800040', // Guindo AGETIC
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#e0e0e0',
    },
  },
  typography: {
    fontFamily: ['"Roboto"', 'sans-serif'].join(','),
  },
})

export default theme
