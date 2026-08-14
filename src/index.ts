// 插件主体：注册 Tavily provider 进 ctx.web；settings 域（web-search-tavily 命名空间）
// 每搜索覆盖组合配置，key 经 credentials 服务解析（UI 写入的凭据域）。

import type { Context } from '@deepseek-ai/cordis'
import { launchEnvironmentOf } from '@deepseek-ai/dsh-launch-environment'
import { credentialRef } from '@deepseek-ai/dsh-credentials'
import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings'
import z from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-web'
import {
  TAVILY_DEFAULT_API_KEY_REF,
  TAVILY_DEFAULT_BASE_URL,
  TAVILY_PROVIDER_ID,
  TavilySearchProvider,
  type TavilySearchProviderOptions,
} from './provider.js'

export {
  TAVILY_DEFAULT_API_KEY_REF,
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
  /** Tavily API key; overrides the credential reference when present. */
  apiKey?: string
  /** Credential reference resolving the key from the launch environment. */
  apiKeyEnv?: string
  /** Endpoint base; `/search` is appended. Defaults to the public API. */
  baseURL?: string
  /** Default result count when a request carries no `maxResults`. Omitted = none. */
  maxResults?: number
}

export const Config: z<Config> = z.object({
  apiKey: z.string(),
  apiKeyEnv: z.string(),
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
  ctx.web.registerSearchProvider(new TavilySearchProvider(() => resolveOptions(ctx, current())))
}

/**
 * Project the section/composition value into provider options: the apiKey
 * resolves from the credential reference (`apiKeyEnv` ?? default) via the
 * launch environment; a literal `apiKey` wins over it.
 */
function resolveOptions(ctx: Context, config: Config): TavilySearchProviderOptions {
  const apiKeyEnv = credentialRef(config.apiKeyEnv ?? TAVILY_DEFAULT_API_KEY_REF)
  const literalApiKey = config.apiKey !== undefined && config.apiKey.length > 0
    ? config.apiKey
    : undefined
  return {
    ...literalApiKey === undefined ? {} : { apiKey: literalApiKey },
    resolveApiKey: async () => {
      const credentials = ctx.get('credentials')
      if (credentials !== undefined) return (await credentials.resolve(apiKeyEnv))?.value
      // Without the seam the environment is the whole credential plane.
      const ambient = launchEnvironmentOf(ctx).get(apiKeyEnv)
      return ambient !== undefined && ambient.value.length > 0 ? ambient.value : undefined
    },
    baseURL: config.baseURL ?? TAVILY_DEFAULT_BASE_URL,
    ...config.maxResults !== undefined ? { maxResults: config.maxResults } : {},
  }
}
