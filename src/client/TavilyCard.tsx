// Tavily provider 卡片：官方 PluginCard 壳 + 官方字段布局（API Key 凭据气泡、
// 接口地址、默认结果条数）。组件与样式从官方包内联（esbuild noExternal + css-modules）。
const React = require('react') as typeof import('react')
const { useSyncExternalStore } = require('react') as typeof import('react')
const { PluginCard } = require('../vendor/plugin-card/PluginCard.js') as typeof import('../vendor/plugin-card/PluginCard.js')
const { SecretField, ValueField } = require('./fields.js') as typeof import('./fields.js')
import type { CardShell } from '@deepseek-ai/dsh-client-ui-settings-plugins/client'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { TavilyCardFace } from './tavily-card-controller.js'

/** Props the renderer binds for the Tavily settings section. */
export type TavilyCardProps =
  PropsRuntime<'settings.plugin.item'>
  & PropsLocale<'web-search-tavily'>
  & InjectFace<TavilyCardFace>

/** Section value rendered as a field's draft seed. */
function seedOf(value: string | number | undefined): string {
  return value === undefined ? '' : String(value)
}

/** Render the Tavily card (official WebSearchCard field layout). */
export function TavilyCard(props: TavilyCardProps) {
  const { tavilyCard, t } = props
  const state = useSyncExternalStore(tavilyCard.subscribe, tavilyCard.getState)
  const [keyDraft, setKeyDraft] = React.useState('')
  const [keyEdited, setKeyEdited] = React.useState(false) // 空草稿≠未编辑：清空 key 保存 = 真清除
  const [baseURLDraft, setBaseURLDraft] = React.useState(seedOf(state.baseURL))
  const [maxResultsDraft, setMaxResultsDraft] = React.useState(seedOf(state.maxResults))
  const [saving, setSaving] = React.useState(false)
  const [failed, setFailed] = React.useState(false)
  // 草稿优先：外部改 section 不覆盖正在输入的草稿，保存时以草稿为准
  const seedBaseURL = seedOf(state.baseURL)
  const seedMaxResults = seedOf(state.maxResults)
  const trimmedMax = maxResultsDraft.trim()
  const maxResultsInvalid = trimmedMax !== '' && !(Number.isInteger(Number(trimmedMax)) && Number(trimmedMax) >= 1)
  const shell: CardShell = {
    available: true, // 写死：settings 域 status 不 ready 的历史行为（0382761 验证形态）
    writable: state.apiKeyWritable,
    dirty: keyEdited || baseURLDraft !== seedBaseURL || maxResultsDraft !== seedMaxResults || failed,
    invalid: maxResultsInvalid,
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
        void tavilyCard.save({
          apiKey: keyDraft,
          baseURL: baseURLDraft,
          maxResults: maxResultsDraft,
        }).then((ok) => {
          setSaving(false)
          setFailed(!ok)
          if (ok) {
            // 三字段同一处重置（草稿=本次提交值）；失败保留草稿（官方 failed 语义）
            setKeyDraft('')
            setKeyEdited(false)
            setBaseURLDraft(baseURLDraft.trim())
            setMaxResultsDraft(maxResultsDraft.trim())
          }
        })
      }}
      onDiscard={() => {
        setKeyDraft('')
        setKeyEdited(false)
        setBaseURLDraft(seedBaseURL)
        setMaxResultsDraft(seedMaxResults)
        setFailed(false)
      }}
    >
      <SecretField
        id="tavily-section-api-key"
        label={t('webSearchApiKey')}
        hint={t('webSearchApiKeyHint')}
        // 凭据域与设置域是独立存储：key 的可用性由凭据域说了算，禁用只看它
        disabled={!state.apiKeyWritable}
        text={keyDraft}
        configured={state.apiKeyConfigured}
        stateLabel={state.apiKeyConfigured ? t('webSearchApiKeySet') : t('webSearchApiKeyUnset')}
        onEdit={(text) => { setKeyDraft(text); setKeyEdited(true); setFailed(false) }}
      />
      <ValueField
        id="tavily-section-base-url"
        label={t('webSearchBaseUrl')}
        hint={t('webSearchBaseUrlHint')}
        overriddenLabel={t('overridden')}
        resetLabel={t('reset')}
        invalidLabel={t('invalidNumber')}
        disabled={!state.apiKeyWritable}
        text={baseURLDraft}
        overridden={state.baseURL !== undefined}
        invalid={false}
        onEdit={(text) => { setBaseURLDraft(text); setFailed(false) }}
        onReset={() => { setBaseURLDraft(''); setFailed(false) }}
      />
      <ValueField
        id="tavily-section-max-results"
        label={t('webSearchMaxResults')}
        hint={t('webSearchMaxResultsHint')}
        overriddenLabel={t('overridden')}
        resetLabel={t('reset')}
        invalidLabel={t('invalidNumber')}
        numeric
        disabled={!state.apiKeyWritable}
        text={maxResultsDraft}
        overridden={state.maxResults !== undefined}
        invalid={maxResultsInvalid}
        onEdit={(text) => { setMaxResultsDraft(text); setFailed(false) }}
        onReset={() => { setMaxResultsDraft(''); setFailed(false) }}
      />
    </PluginCard>
  )
}
