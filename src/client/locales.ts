/** Localized copy for the Tavily card (registered under the plugin's own NS). */

import type {} from '@deepseek-ai/dsh-client-ui-slots'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The Tavily card's copy. */
    'web-search-tavily': TavilyCopyKey
  }
}

export type TavilyCopyKey = keyof typeof zh
export const NS = 'web-search-tavily'

export const zh = {
  webSearchTitle: 'Tavily 搜索',
  webSearchDescription: '配置 Tavily 搜索 provider（取代 DeepSeek 官方搜索）',
  webSearchApiKey: 'API Key',
  webSearchApiKeyHint: 'tavily.com 注册的 key；经凭据域写入，不进设置文档',
  webSearchApiKeySet: '已配置',
  webSearchApiKeyUnset: '未配置',
  webSearchBaseUrl: '接口地址',
  webSearchBaseUrlHint: '默认 https://api.tavily.com',
  webSearchMaxResults: '默认结果数',
  webSearchMaxResultsHint: '留空不限制（请求级优先）',
  overridden: '已覆盖',
  default: '默认',
  save: '保存',
}

export const en: Record<keyof typeof zh, string> = {
  webSearchTitle: 'Tavily Search',
  webSearchDescription: 'Configure the Tavily search provider (replaces DeepSeek search)',
  webSearchApiKey: 'API Key',
  webSearchApiKeyHint: 'Key from tavily.com; written through the credentials domain',
  webSearchApiKeySet: 'Configured',
  webSearchApiKeyUnset: 'Not configured',
  webSearchBaseUrl: 'Base URL',
  webSearchBaseUrlHint: 'Default https://api.tavily.com',
  webSearchMaxResults: 'Default result count',
  webSearchMaxResultsHint: 'Empty = no limit (per-request wins)',
  overridden: 'Overridden',
  default: 'Default',
  save: 'Save',
}
