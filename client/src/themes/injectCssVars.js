import { tokens } from './tokens'

// Maps design tokens onto the existing CSS custom property names used
// throughout the plain-CSS files (App.css, components.css, etc.) so both
// MUI components and hand-written CSS read from the same source of truth.
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
    '--radius-card': `${tokens.radius.card}px`,
}

export function injectCssVars() {
    const root = document.documentElement
    Object.entries(cssVarMap).forEach(([name, value]) => {
        root.style.setProperty(name, value)
    })
}

export default injectCssVars
