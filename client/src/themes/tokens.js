// Single source of truth for design tokens (color, spacing, radius, typography).
// Consumed by the MUI theme (src/theme/material-ui-theme.js) for MUI components,
// and injected as CSS custom properties (src/theme/injectCssVars.js) for plain CSS.

export const color = {
    black: '#000000',
    white: '#ffffff',
    primary: '#e35a47',
    primaryDark: '#c0311d',
    secondary: '#1DADC0',
    secondaryDark: '#178796',
    accent: '#F2A93B',
    accentDark: '#b67f2c',
    highlight: '#EFA095',
    surface: '#fef5f4',
    grey: 'rgb(204, 195, 195)',
}

// Named color schemes selectable on components like Button — each maps to a
// base/dark pair of tokens above so a component can flip schemes via a
// single `variant` prop instead of hardcoding colors per usage.
export const colorScheme = {
    primary: { base: color.primary, dark: color.primaryDark },
    secondary: { base: color.secondary, dark: color.secondaryDark },
    accent: { base: color.accent, dark: color.accentDark },
}

export const radius = {
    sm: 4,
    md: 8,
    lg: 16,
}

export const spacingUnit = 8

// General-purpose margin/padding scale for plain CSS (injected as
// --spacing-* custom properties — see injectCssVars.js). Not strictly tied
// to spacingUnit above (that one's just for MUI's theme.spacing()); this is
// the set of values everyday layout code should reach for instead of
// hardcoding pixel margins.
export const spacing = {
    xs: 4,
    sm: 3,
    md: 9,
    lg: 15,
    xl: 24,
}

export const font = {
    family: "'Montserrat', 'Helvetica', 'Arial', sans-serif",
    weight: {
        light: 100,
        regular: 400,
        medium: 500,
        bold: 700,
    },
}

export const tokens = { color, colorScheme, radius, spacingUnit, spacing, font }

export default tokens
