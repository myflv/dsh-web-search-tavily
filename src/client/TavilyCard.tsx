/**
 * The Tavily search provider card: its endpoint, its per-request result
 * budget, and the key — written through the credentials domain, never into
 * the settings section.
 */

const React = require('react') as typeof import('react')
const { useSyncExternalStore } = require('react') as typeof import('react')
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
const { SecretField, ValueField } = require('./fields.js') as typeof import('./fields.js')
import type { TavilyCardFace } from './tavily-card-controller.js'

/** Props the renderer binds for the Tavily card. */
export type TavilyCardProps =
  PropsRuntime<'settings.plugin.item'>
  & PropsLocale<'web-search-tavily'>
  & InjectFace<TavilyCardFace>

/** Render the Tavily card. */
export function TavilyCard(props: TavilyCardProps) {
  const { t, tavilyCard } = props
  const state = useSyncExternalStore(tavilyCard.subscribe, tavilyCard.getState)
  const [draft, setDraft] = React.useState<{ baseURL?: string; maxResults?: string; apiKey?: string }>({})
  const disabled = !state.writable
  return (
    <section>
      <h3>{t('webSearchTitle')}</h3>
      <p>{t('webSearchDescription')}</p>
      <SecretField
        id="tavily-card-api-key"
        label={t('webSearchApiKey')}
        hint={t('webSearchApiKeyHint')}
        configured={state.apiKeyConfigured}
        stateLabel={state.apiKeyConfigured ? t('webSearchApiKeySet') : t('webSearchApiKeyUnset')}
        disabled={!state.apiKeyWritable}
        text={draft.apiKey ?? ''}
        onEdit={(text) => { setDraft((d) => ({ ...d, apiKey: text })) }}
      />
      <ValueField
        id="tavily-card-base-url"
        label={t('webSearchBaseUrl')}
        hint={t('webSearchBaseUrlHint')}
        stateLabel={state.baseURL === '' ? t('default') : t('overridden')}
        disabled={disabled}
        text={draft.baseURL ?? state.baseURL}
        onEdit={(text) => { setDraft((d) => ({ ...d, baseURL: text })) }}
      />
      <ValueField
        id="tavily-card-max-results"
        label={t('webSearchMaxResults')}
        hint={t('webSearchMaxResultsHint')}
        stateLabel={state.maxResults === '' ? t('default') : t('overridden')}
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
        {t('save')}
      </button>
    </section>
  )
}
