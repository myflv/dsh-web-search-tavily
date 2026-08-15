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
  webSearchTitle: '网页搜索',
  webSearchDescription: 'Tavily 搜索提供方。',
  webSearchApiKey: 'API Key',
  webSearchApiKeyHint: '未配置时使用keyless模式',
  webSearchApiKeySet: '已配置',
  webSearchApiKeyUnset: '未配置',
  webSearchBaseUrl: '接口地址',
  webSearchBaseUrlHint: '留空则使用提供方默认地址。',
  webSearchMaxResults: '默认结果条数',
  webSearchMaxResultsHint: '留空则使用提供方默认值。',
  overridden: '已覆盖',
  reset: '恢复默认',
  invalidNumber: '请填数字；留空表示使用默认值。',
  save: '保存',
  discard: '放弃修改',
  saving: '保存中…',
  saveFailed: '保存失败',
  unsaved: '未保存',
  readOnly: '只读',
  collapse: '收起',
  expand: '展开',
}
export const en: Record<keyof typeof zh, string> = {
  webSearchTitle: 'Web search',
  webSearchDescription: 'The Tavily search provider.',
  webSearchApiKey: 'API Key',
  webSearchApiKeyHint: 'Unset uses keyless mode',
  webSearchApiKeySet: 'Configured',
  webSearchApiKeyUnset: 'Not configured',
  webSearchBaseUrl: 'Endpoint',
  webSearchBaseUrlHint: 'Leave blank to use the provider default.',
  webSearchMaxResults: 'Default result count',
  webSearchMaxResultsHint: 'Leave blank to use the provider default.',
  overridden: 'Overridden',
  reset: 'Reset to default',
  invalidNumber: 'Enter a number, or leave blank to use the default.',
  save: 'Save',
  discard: 'Discard',
  saving: 'Saving…',
  saveFailed: 'Save failed',
  unsaved: 'Unsaved',
  readOnly: 'Read only',
  collapse: 'Collapse',
  expand: 'Expand',
}
