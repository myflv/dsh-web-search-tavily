// Tavily provider 卡片：官方 PluginCard 壳（标题/描述/展开/保存放弃），
// key 编辑走凭据域。组件与样式从官方包内联（esbuild noExternal + css-modules）。
const React = require('react') as typeof import('react')
const { useSyncExternalStore } = require('react') as typeof import('react')
const { PluginCard } = require('../vendor/plugin-card/PluginCard.js') as typeof import('../vendor/plugin-card/PluginCard.js')
const { SecretField } = require('./fields.js') as typeof import('./fields.js')
const { zh } = require('./locales.js') as typeof import('./locales.js')
import type { CardShell } from '../vendor/plugin-card/types.js'
import type { InjectFace, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { TavilyCardFace } from './tavily-card-controller.js'

/** Props the renderer binds for the Tavily settings section. */
export type TavilyCardProps =
  PropsRuntime<'settings.plugin.item'>
  & InjectFace<TavilyCardFace>

/** Render the Tavily card (official PluginCard chrome). */
export function TavilyCard(props: TavilyCardProps) {
  const { tavilyCard } = props
  const state = useSyncExternalStore(tavilyCard.subscribe, tavilyCard.getState)
  const [keyDraft, setKeyDraft] = React.useState('')
  const shell: CardShell = {
    available: true,
    writable: state.apiKeyWritable,
    dirty: keyDraft.trim() !== '',
    invalid: false,
    saving: false,
    failed: false,
  }
  // 官方键名（webSearchTitle/unsaved/readOnly/...）→ 我们的文案
  const t = (key: string): string => (zh as Record<string, string>)[key] ?? key
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0, maxWidth: 560 }}>
      <PluginCard
        t={t}
        titleKey="webSearchTitle"
        descriptionKey="webSearchDescription"
        state={shell}
        onSave={() => { void tavilyCard.save(keyDraft); setKeyDraft('') }}
        onDiscard={() => { setKeyDraft('') }}
      >
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
      </PluginCard>
    </ul>
  )
}
