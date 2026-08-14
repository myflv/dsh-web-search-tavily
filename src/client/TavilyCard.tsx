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
  PropsRuntime<'settings.plugin.item'>
  & InjectFace<TavilyCardFace>

/** Render the Tavily settings section. */
export function TavilyCard(props: TavilyCardProps) {
  const { tavilyCard } = props
  const state = useSyncExternalStore(tavilyCard.subscribe, tavilyCard.getState)
  const [draft, setDraft] = React.useState<{ baseURL?: string; maxResults?: string; apiKey?: string }>({})
  const disabled = !state.writable
  return (
    <section>
      <h3>{zh.webSearchTitle}</h3>
      <p>{zh.webSearchDescription}</p>
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
      <button
        disabled={disabled}
        onClick={() => {
          void tavilyCard.save(draft)
          setDraft({})
        }}
      >
        {zh.save}
      </button>
    </section>
  )
}
