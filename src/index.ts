// 插件主体：注册 Tavily provider 进 ctx.web；settings 域（web-search-tavily
// 命名空间）三字段（apiKey/baseURL/maxResults）全部明文经 UI 读写，
// 每搜索覆盖组合配置。

import type { Context } from '@deepseek-ai/cordis'
import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings'
import z from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-web'
import {
  TAVILY_DEFAULT_BASE_URL,
  TAVILY_PROVIDER_ID,
  TavilySearchProvider,
  type TavilySearchProviderOptions,
} from './provider.js'

export {
  TAVILY_DEFAULT_BASE_URL,
  TAVILY_PROVIDER_ID,
  TavilySearchProvider,
} from './provider.js'
export type { TavilySearchProviderOptions } from './provider.js'

/** Cordis plugin name used by loader diagnostics. */
export const name = 'web-search-tavily'

/** The web seam this provider registers into. */
export const inject = ['web']

/** Settings namespace the web section edits (the plugin's own id). */
export const WEB_SEARCH_TAVILY_SETTINGS_NAMESPACE = 'web-search-tavily'

/** Plugin config — the settings section overlays these per search. */
export interface Config {
  /** Tavily API key; blank inherits the composition layer (env patch). */
  apiKey?: string
  /** Endpoint base; `/search` is appended. Defaults to the public API. */
  baseURL?: string
  /** Default result count when a request carries no `maxResults`. Omitted = none. */
  maxResults?: number
}

export const Config: z<Config> = z.object({
  // 明文存储（与 baseURL 同域）：UI 可显示、可编辑、可清空；空 → keyless
  apiKey: z.string(),
  // schemastery object 字段默认可选：组合层不写 endpoint/条数时留空，继承 provider 默认
  baseURL: z.string(),
  maxResults: z.number().step(1).min(1),
})

/** Register the Tavily search provider with `ctx.web`, settings-section backed. */
export function apply(ctx: Context, config: Config): void {
  let current: () => Config = () => config
  installSettingsSection(ctx, settingsNamespace(WEB_SEARCH_TAVILY_SETTINGS_NAMESPACE), Config, config, {
    setSource: (source) => {
      current = source
    },
    // The registration carries no resolved value: the provider projects the
    // section per search, so a committed change needs no re-registration.
    onChange: () => {},
  })
  ctx.web.registerSearchProvider(new TavilySearchProvider(() => resolveOptions(current())))
}

/**
 * Project the section/composition value into provider options: all three
 * fields are plain settings values — the UI writes the same domain the
 * provider reads, so what the card shows is exactly what search uses.
 */
function resolveOptions(config: Config): TavilySearchProviderOptions {
  return {
    apiKey: config.apiKey,
    baseURL: config.baseURL ?? TAVILY_DEFAULT_BASE_URL,
    ...config.maxResults !== undefined ? { maxResults: config.maxResults } : {},
  }
}
