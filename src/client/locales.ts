/** Tavily 设置区块文案（zh/en，nav 复用 webSearchTitle）。 */

import type {} from '@deepseek-ai/dsh-client-ui-slots'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The Tavily section's copy. */
    'web-search-tavily': TavilyCopyKey
  }
}

export type TavilyCopyKey = keyof typeof zh
export const NS = 'web-search-tavily'

export const zh = {
  webSearchTitle: 'Tavily 搜索',
  webSearchDescription: 'Tavily 搜索 provider。',
  webSearchApiKey: 'API Key',
  webSearchApiKeyHint: '未配置时自动走官方 keyless 免费模式',
  webSearchApiKeySet: '已配置',
  webSearchApiKeyUnset: '未配置',
  providerName: 'Tavily',
  edit: '编辑',
  delete: '删除',
  cancel: '取消',
  save: '保存',
  saving: '保存中…',
  saveFailed: '保存失败',
  unsaved: '未保存',
  readOnly: '只读',
  collapse: '收起',
  expand: '展开',
}
export const en: Record<keyof typeof zh, string> = {
  webSearchTitle: 'Tavily Search',
  webSearchDescription: 'The Tavily search provider.',
  webSearchApiKey: 'API Key',
  webSearchApiKeyHint: 'Unset uses the official keyless mode',
  webSearchApiKeySet: 'Configured',
  webSearchApiKeyUnset: 'Not configured',
  providerName: 'Tavily',
  edit: 'Edit',
  delete: 'Delete',
  cancel: 'Cancel',
  save: 'Save',
  saving: 'Saving…',
  saveFailed: 'Save failed',
  unsaved: 'Unsaved',
  readOnly: 'Read only',
  collapse: 'Collapse',
  expand: 'Expand',
}
