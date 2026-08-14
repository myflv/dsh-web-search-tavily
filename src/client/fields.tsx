/** Secret 字段：key 经凭据域写入。 */

const React = require('react') as typeof import('react')

export interface FieldProps {
  id: string
  label: string
  hint: string
  text: string
  disabled?: boolean
  onEdit: (text: string) => void
}

const fieldStyle: React.CSSProperties = { display: 'block', margin: '12px 0' }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }
const inputStyle: React.CSSProperties = {
  display: 'block', width: '100%', height: 36, padding: '0 10px', fontSize: 13,
  fontFamily: 'inherit', color: 'var(--text-1, inherit)', background: 'var(--bg, transparent)',
  border: '1px solid rgba(128, 128, 128, 0.35)', borderRadius: 8, outline: 'none', boxSizing: 'border-box',
}
const hintStyle: React.CSSProperties = { display: 'block', fontSize: 12, opacity: 0.6, marginTop: 4 }
const stateStyle: React.CSSProperties = { fontSize: 12, marginLeft: 8, opacity: 0.7 }

/** Secret 字段：空白加载、编辑暂存、徽标显示 key 是否存在。 */
export function SecretField(props: FieldProps & { configured: boolean; stateLabel: string }) {
  return (
    <label htmlFor={props.id} style={fieldStyle}>
      <span style={labelStyle}>{props.label}</span>
      <span style={stateStyle}>{props.stateLabel}</span>
      <input
        id={props.id}
        type="password"
        style={inputStyle}
        value={props.text}
        disabled={props.disabled}
        onChange={(e) => { props.onEdit(e.target.value) }}
      />
      <small style={hintStyle}>{props.hint}</small>
    </label>
  )
}
