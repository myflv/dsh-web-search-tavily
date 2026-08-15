// Tavily provider 卡片：官方 PluginCard 壳（标题/描述/展开/保存放弃），
// key 编辑走凭据域。组件与样式从官方包内联（esbuild noExternal + css-modules）。
const React = require('react') as typeof import('react')
const { useSyncExternalStore } = require('react') as typeof import('react')
const { PluginCard } = require('../vendor/plugin-card/PluginCard.js') as typeof import('../vendor/plugin-card/PluginCard.js')
const { SecretField } = require('./fields.js') as typeof import('./fields.js')
const { zh } = require('./locales.js') as typeof import('./locales.js')
import type { CardShell } from '@deepseek-ai/dsh-client-ui-settings-plugins/client'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { TavilyCardFace } from './tavily-card-controller.js'

/** Props the renderer binds for the Tavily settings section. */
export type TavilyCardProps =
  PropsRuntime<'settings.plugin.item'>
  & PropsLocale<'web-search-tavily'>
  & InjectFace<TavilyCardFace>

/** Render the Tavily card (official PluginCard chrome). */
export function TavilyCard(props: TavilyCardProps) {
  const { tavilyCard, t } = props
  const state = useSyncExternalStore(tavilyCard.subscribe, tavilyCard.getState)
  const [keyDraft, setKeyDraft] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [failed, setFailed] = React.useState(false)
  const shell: CardShell = {
    available: true,
    writable: state.apiKeyWritable,
    dirty: keyDraft.trim() !== '' || failed,
    invalid: false,
    saving,
    failed,
  }
  return (
    // 宿主渲染器已提供 <ul> 列表容器，这里只返回卡片 <li>
    <PluginCard
      t={(key: string) => t(key as keyof typeof import('./locales.js').zh)}
      titleKey="webSearchTitle"
      descriptionKey="webSearchDescription"
      state={shell}
      onSave={() => {
        setSaving(true)
        void tavilyCard.save(keyDraft).then((configured) => {
          setSaving(false)
          setFailed(!configured)
          if (configured) setKeyDraft('') // 失败保留草稿（官方 failed 语义）
        })
      }}
      onDiscard={() => { setKeyDraft(''); setFailed(false) }}
    >
      <SecretField
        id="tavily-section-api-key"
        label={t('webSearchApiKey')}
        hint={t('webSearchApiKeyHint')}
        configured={state.apiKeyConfigured}
        stateLabel={state.apiKeyConfigured ? t('webSearchApiKeySet') : t('webSearchApiKeyUnset')}
        disabled={!state.apiKeyWritable}
        text={keyDraft}
        onEdit={(text) => { setKeyDraft(text); setFailed(false) }}
      />
    </PluginCard>
  )
}
