/**
 * Lightweight form fields for the Tavily card: a secret (key) field writing
 * through the credentials domain and plain value fields. Simplified from
 * `@deepseek-ai/dsh-client-ui-settings-plugins/fields` (which is not on that
 * package's public export face).
 */

const React = require('react') as typeof import('react')

/** Shared field chrome: label, hint, edit affordance, disabled state. */
export interface FieldProps {
  /** Stable DOM id (label wiring). */
  id: string
  label: string
  hint: string
  /** Staged text. */
  text: string
  /** Disables the control (read-only section). */
  disabled?: boolean
  onEdit: (text: string) => void
}

/** Plain value field with a configured/overridden state label. */
export function ValueField(props: FieldProps & { stateLabel: string }) {
  return (
    <label htmlFor={props.id} style={{ display: 'block', margin: '12px 0' }}>
      <span>{props.label}</span>
      <input
        id={props.id}
        value={props.text}
        disabled={props.disabled}
        onChange={(e) => { props.onEdit(e.target.value) }}
      />
      <span>{props.stateLabel}</span>
      <small>{props.hint}</small>
    </label>
  )
}

/** Secret field: blank on load, staged on edit, badge shows whether a key exists. */
export function SecretField(props: FieldProps & { configured: boolean; stateLabel: string }) {
  return (
    <label htmlFor={props.id} style={{ display: 'block', margin: '12px 0' }}>
      <span>{props.label}</span>
      <input
        id={props.id}
        type="password"
        value={props.text}
        disabled={props.disabled}
        onChange={(e) => { props.onEdit(e.target.value) }}
      />
      <span>{props.stateLabel}</span>
      <small>{props.hint}</small>
    </label>
  )
}
