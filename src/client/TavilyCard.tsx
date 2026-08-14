/**
 * The Tavily search provider settings section: its endpoint, its per-request
 * result budget, and the key — written through the credentials domain, never
 * into the settings section. Rendered by the Settings shell's
 * `settings.plugin.item` card slot (the plugins tab's declaration).
 */

const React = require('react') as typeof import('react')
const { useSyncExternalStore } = require('react') as typeof import('react')
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
const { SecretField, ValueField } = require('./fields.js') as typeof import('./fields.js')
const { zh } = require('./locales.js') as typeof import('./locales.js')
import type { TavilyCardFace } from './tavily-card-controller.js'

/** Props the renderer binds for the Tavily settings section. */
export type TavilyCardProps =
  PropsRuntime<'settings.section'>
  & InjectFace<TavilyCardFace>

/** Section chrome (mirrors the settings shell's own sections). */
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

const groupStyle: React.CSSProperties = {
  maxWidth: 420,
}

const actionsStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  marginTop: 12,
}

const saveStyle: React.CSSProperties = {
  height: 32,
  padding: '0 20px',
  borderRadius: 100,
  border: 'none',
  background: 'var(--text-1, #111)',
  color: 'var(--bg, #fff)',
  fontSize: 13,
  fontWeight: 500,
  fontFamily: 'inherit',
  cursor: 'pointer',
}

const discardStyle: React.CSSProperties = {
  ...saveStyle,
  background: 'transparent',
  color: 'var(--text-1, inherit)',
  border: '1px solid rgba(128, 128, 128, 0.4)',
}

/** Render the Tavily settings section. */
export function TavilyCard(props: TavilyCardProps) {
  const { tavilyCard } = props
  const state = useSyncExternalStore(tavilyCard.subscribe, tavilyCard.getState)
  const [draft, setDraft] = React.useState<{ baseURL?: string; maxResults?: string; apiKey?: string }>({})
  const disabled = !state.writable
  const hasEdits = Object.keys(draft).length > 0
  return (
    <section>
      <h2 style={titleStyle}>{zh.webSearchTitle}</h2>
      <p style={introStyle}>{zh.webSearchDescription}</p>
      <div style={groupStyle}>
      <SecretField
        id="tavily-section-api-key"
        label={zh.webSearchApiKey}
        hint={zh.webSearchApiKeyHint}
        configured={state.apiKeyConfigured}
        stateLabel={state.apiKeyConfigured ? zh.webSearchApiKeySet : zh.webSearchApiKeyUnset}
        disabled={!state.apiKeyWritable}
        text={draft.apiKey ?? ''}
        onEdit={(text) => { setDraft((d) => ({ ...d, apiKey: text })) }}
      />
      <ValueField
        id="tavily-section-base-url"
        label={zh.webSearchBaseUrl}
        hint={zh.webSearchBaseUrlHint}
        stateLabel={state.baseURL === '' ? zh.default : zh.overridden}
        disabled={disabled}
        text={draft.baseURL ?? state.baseURL}
        onEdit={(text) => { setDraft((d) => ({ ...d, baseURL: text })) }}
      />
      <ValueField
        id="tavily-section-max-results"
        label={zh.webSearchMaxResults}
        hint={zh.webSearchMaxResultsHint}
        stateLabel={state.maxResults === '' ? zh.default : zh.overridden}
        disabled={disabled}
        text={draft.maxResults ?? state.maxResults}
        onEdit={(text) => { setDraft((d) => ({ ...d, maxResults: text })) }}
      />
      <div style={actionsStyle}>
        <button
          style={saveStyle}
          disabled={disabled || !hasEdits}
          onClick={() => {
            void tavilyCard.save(draft)
            setDraft({})
          }}
        >
          {zh.save}
        </button>
        {hasEdits ? (
          <button style={discardStyle} onClick={() => { setDraft({}) }}>
            {zh.discard}
          </button>
        ) : null}
      </div>
      </div>
    </section>
  )
}
