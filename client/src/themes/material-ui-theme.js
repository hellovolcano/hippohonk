import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#e35a47',
    },
    secondary: {
      main: '#c0311d',
    },
    text: {
      primary: 'rgba(0,0,0,0.87)',
      hint: '#ffffff',
    },
    info: {
      main: '#fef5f4',
    },
  },
  overrides: {
    MuiPaginationItem: {
        root: {
          color: '#fef5f4',
        },
    },
  },
  typography: {
    fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
    fontWeightLight: 100,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
})

export default theme
