// Single source of truth for design tokens (color, spacing, radius, typography).
// Consumed by the MUI theme (src/theme/material-ui-theme.js) for MUI components,
// and injected as CSS custom properties (src/theme/injectCssVars.js) for plain CSS.

export const color = {
    black: '#000000',
    white: '#ffffff',
    primary: '#e35a47',
    primaryDark: '#c0311d',
    secondary: '#66454f',
    highlight: '#666445',
    surface: '#fef5f4',
    grey: 'rgb(204, 195, 195)',
}

export const radius = {
    sm: 2,
    card: 16,
}

export const spacingUnit = 8

export const font = {
    family: "'Montserrat', 'Helvetica', 'Arial', sans-serif",
    weight: {
        light: 100,
        regular: 400,
        medium: 500,
        bold: 700,
    },
}

export const tokens = { color, radius, spacingUnit, font }

export default tokens
