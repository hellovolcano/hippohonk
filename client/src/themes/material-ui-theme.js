import { createTheme } from '@mui/material/styles'
import { tokens } from './tokens'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: tokens.color.primary,
    },
    secondary: {
      main: tokens.color.primaryDark,
    },
    text: {
      primary: 'rgba(0,0,0,0.87)',
      hint: tokens.color.white,
    },
    info: {
      main: tokens.color.surface,
    },
  },
  shape: {
    borderRadius: tokens.radius.sm,
  },
  spacing: tokens.spacingUnit,
  typography: {
    fontFamily: tokens.font.family,
    fontWeightLight: tokens.font.weight.light,
    fontWeightRegular: tokens.font.weight.regular,
    fontWeightMedium: tokens.font.weight.medium,
    fontWeightBold: tokens.font.weight.bold,
  },
  components: {
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          color: tokens.color.surface,
        },
      },
    },
  },
})

export default theme
