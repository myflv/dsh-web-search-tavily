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
  nav: 'Tavily 搜索',
  webSearchTitle: 'Tavily 搜索',
  webSearchDescription: '填入 Tavily API 密钥即可使用 Tavily 搜索（取代 DeepSeek 官方搜索）',
  webSearchApiKey: 'API Key',
  webSearchApiKeyHint: 'tavily.com 注册的 key；经凭据域写入，不进设置文档',
  webSearchApiKeySet: '已配置',
  webSearchApiKeyUnset: '未配置',
  providerName: 'Tavily',
  edit: '编辑',
  delete: '删除',
  cancel: '取消',
  save: '保存',
}

export const en: Record<keyof typeof zh, string> = {
  nav: 'Tavily Search',
  webSearchTitle: 'Tavily Search',
  webSearchDescription: 'Enter your Tavily API key to enable Tavily search (replaces DeepSeek search)',
  webSearchApiKey: 'API Key',
  webSearchApiKeyHint: 'Key from tavily.com; written through the credentials domain',
  webSearchApiKeySet: 'Configured',
  webSearchApiKeyUnset: 'Not configured',
  providerName: 'Tavily',
  edit: 'Edit',
  delete: 'Delete',
  cancel: 'Cancel',
  save: 'Save',
}
