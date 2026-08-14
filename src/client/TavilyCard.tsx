// Tavily provider 行（对齐模型 section）：行名 + 密钥圆点 + 编辑/删除；编辑展开 key 输入。

const React = require('react') as typeof import('react')
const { useSyncExternalStore } = require('react') as typeof import('react')
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
const { SecretField } = require('./fields.js') as typeof import('./fields.js')
const { zh } = require('./locales.js') as typeof import('./locales.js')
import type { TavilyCardFace } from './tavily-card-controller.js'

/** Props the renderer binds for the Tavily settings section. */
export type TavilyCardProps =
  PropsRuntime<'settings.section'>
  & InjectFace<TavilyCardFace>

const titleStyle: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 600,
  margin: '0 0 6px',
}

const introStyle: React.CSSProperties = {
  fontSize: 13,
  opacity: 0.65,
  margin: '0 0 16px',
  maxWidth: 520,
}

const rowsStyle: React.CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  maxWidth: 520,
}

const rowCardStyle: React.CSSProperties = {
  border: '1px solid rgba(128, 128, 128, 0.25)',
  borderRadius: 10,
  padding: '10px 14px',
}

const rowHeadStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}

const rowIdentityStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}

const rowNameStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
}

const dotStyle = (configured: boolean): React.CSSProperties => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: configured ? '#3fb950' : 'rgba(128, 128, 128, 0.5)',
  display: 'inline-block',
})

const rowActionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
}

const secondaryStyle: React.CSSProperties = {
  height: 28,
  padding: '0 14px',
  borderRadius: 8,
  border: '1px solid rgba(128, 128, 128, 0.35)',
  background: 'transparent',
  color: 'var(--text-1, inherit)',
  fontSize: 13,
  fontFamily: 'inherit',
  cursor: 'pointer',
}

const dangerStyle: React.CSSProperties = {
  ...secondaryStyle,
  color: '#d73a49',
  borderColor: 'rgba(215, 58, 73, 0.4)',
}

const primaryStyle: React.CSSProperties = {
  ...secondaryStyle,
  background: 'var(--text-1, #111)',
  color: 'var(--bg, #fff)',
  border: 'none',
}

/** Render the Tavily provider row in its settings section. */
export function TavilyCard(props: TavilyCardProps) {
  const { tavilyCard } = props
  const state = useSyncExternalStore(tavilyCard.subscribe, tavilyCard.getState)
  const [editing, setEditing] = React.useState(false)
  const [keyDraft, setKeyDraft] = React.useState('')
  return (
    <section>
      <h2 style={titleStyle}>{zh.webSearchTitle}</h2>
      <p style={introStyle}>{zh.webSearchDescription}</p>
      <ul style={rowsStyle}>
        <li style={rowCardStyle}>
          <div style={rowHeadStyle}>
            <span style={rowIdentityStyle}>
              <span style={rowNameStyle}>{zh.providerName}</span>
              <span
                style={dotStyle(state.apiKeyConfigured)}
                role="img"
                aria-label={state.apiKeyConfigured ? zh.webSearchApiKeySet : zh.webSearchApiKeyUnset}
                title={state.apiKeyConfigured ? zh.webSearchApiKeySet : zh.webSearchApiKeyUnset}
              />
            </span>
            <span style={rowActionsStyle}>
              {editing ? (
                <>
                  <button
                    style={primaryStyle}
                    disabled={keyDraft.trim() === ''}
                    onClick={() => {
                      void tavilyCard.save(keyDraft)
                      setEditing(false)
                      setKeyDraft('')
                    }}
                  >
                    {zh.save}
                  </button>
                  <button style={secondaryStyle} onClick={() => { setEditing(false); setKeyDraft('') }}>
                    {zh.cancel}
                  </button>
                </>
              ) : (
                <>
                  <button
                    style={secondaryStyle}
                    disabled={!state.apiKeyWritable}
                    onClick={() => { setEditing(true) }}
                  >
                    {zh.edit}
                  </button>
                  {state.apiKeyConfigured ? (
                    <button
                      style={dangerStyle}
                      onClick={() => { void tavilyCard.unsetKey() }}
                    >
                      {zh.delete}
                    </button>
                  ) : null}
                </>
              )}
            </span>
          </div>
          {editing ? (
            <SecretField
              id="tavily-section-api-key"
              label={zh.webSearchApiKey}
              hint={zh.webSearchApiKeyHint}
              configured={state.apiKeyConfigured}
              stateLabel={state.apiKeyConfigured ? zh.webSearchApiKeySet : zh.webSearchApiKeyUnset}
              disabled={!state.apiKeyWritable}
              text={keyDraft}
              onEdit={setKeyDraft}
            />
          ) : null}
        </li>
      </ul>
    </section>
  )
}
