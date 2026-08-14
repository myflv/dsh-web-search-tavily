/**
 * `dsh-web-search-tavily`: registers a Tavily-backed `WebSearchProvider` with
 * `ctx.web`. Settings-section backed: the section (`web-search-tavily`
 * namespace) overrides the composition entry per search; the apiKey resolves
 * from the credential reference (`TAVILY_API_KEY` by default) via the launch
 * environment, so the settings UI writes keys through the credentials domain.
 */

import type { Context } from '@deepseek-ai/cordis'
import { launchEnvironmentOf } from '@deepseek-ai/dsh-launch-environment'
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
  const ref = config.apiKeyEnv ?? TAVILY_DEFAULT_API_KEY_REF
  const envKey = launchEnvironmentOf(ctx).get(ref)?.value ?? ''
  return {
    apiKey: config.apiKey ?? envKey,
    baseURL: config.baseURL ?? TAVILY_DEFAULT_BASE_URL,
    ...config.maxResults !== undefined ? { maxResults: config.maxResults } : {},
  }
}
