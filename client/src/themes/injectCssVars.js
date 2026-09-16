import { tokens } from './tokens'

// Maps design tokens onto the existing CSS custom property names used
// throughout the plain CSS files so both MUI components and hand-written
// CSS read from the same source of truth.
const cssVarMap = {
    '--black': tokens.color.black,
    '--white': tokens.color.white,
    '--primary-color': tokens.color.primary,
    '--borders': tokens.color.primary,
    '--darker-color': tokens.color.primaryDark,
    '--secondary-color': tokens.color.secondary,
    '--highlight': tokens.color.highlight,
    '--table-headings': tokens.color.surface,
    '--grey': tokens.color.grey,
    '--radius-sm': `${tokens.radius.sm}px`,
    '--radius-md': `${tokens.radius.md}px`,
    '--radius-lg': `${tokens.radius.lg}px`,

    // Named color-scheme vars, used by components (e.g. Button) that
    // support a `variant` prop to pick between them at render time.
    '--scheme-primary': tokens.colorScheme.primary.base,
    '--scheme-primary-dark': tokens.colorScheme.primary.dark,
    '--scheme-secondary': tokens.colorScheme.secondary.base,
    '--scheme-secondary-dark': tokens.colorScheme.secondary.dark,
    '--scheme-accent': tokens.colorScheme.accent.base,
    '--scheme-accent-dark': tokens.colorScheme.accent.dark,

    // Spacing scale — use these instead of hardcoding margin/padding pixel
    // values in component CSS.
    '--spacing-xs': `${tokens.spacing.xs}px`,
    '--spacing-sm': `${tokens.spacing.sm}px`,
    '--spacing-md': `${tokens.spacing.md}px`,
    '--spacing-lg': `${tokens.spacing.lg}px`,
    '--spacing-xl': `${tokens.spacing.xl}px`,
}

export function injectCssVars() {
    const root = document.documentElement
    Object.entries(cssVarMap).forEach(([name, value]) => {
        root.style.setProperty(name, value)
    })
}

export default injectCssVars
