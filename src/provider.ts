// Tavily provider：POST /search；content→snippet、answer→content、空白条目丢弃；
// options 每搜索投影（settings 域），key 走 credentials 服务（照官方 deepseek）。

import { WebError } from '@deepseek-ai/dsh-web'
import type {
  WebSearchProvider,
  WebSearchRequest,
  WebSearchResult,
  WebSearchSource,
} from '@deepseek-ai/dsh-web'
import type { TavilyError, TavilyResult, TavilySearchResponse } from './types.js'

/** Stable id this provider registers under; the web section's `searchProvider` points at it. */
export const TAVILY_PROVIDER_ID = 'tavily'

/** Default Tavily endpoint; `/search` is the operation. */
export const TAVILY_DEFAULT_BASE_URL = 'https://api.tavily.com'

/** Credential reference resolved when the settings section names none. */
export const TAVILY_DEFAULT_API_KEY_REF = 'TAVILY_API_KEY'

/** Attribution header sent on every request. Bump with the package version. */
const USER_AGENT = 'dsh-web-search-tavily/0.1.4'

/** Resolved provider options (the plugin's `apply` projects them per search). */
export interface TavilySearchProviderOptions {
  /** Literal Tavily API key (composition config); wins over resolution. */
  apiKey?: string
  /** Async key resolution through the credentials seam or the environment. */
  resolveApiKey: () => Promise<string | undefined>
  /** Endpoint base; `/search` is appended. */
  baseURL: string
  /** Default result count when a request carries no `maxResults`. */
  maxResults?: number
}

/**
 * Map one Tavily result to a normalized source, or `undefined` when it carries
 * no portable snippet (a blank entry is dropped rather than invented).
 */
export function mapTavilyResult(result: TavilyResult): WebSearchSource | undefined {
  const snippet = result.content.trim()
  if (snippet.length === 0) return undefined
  return {
    url: result.url,
    ...result.title.length > 0 ? { title: result.title } : {},
    snippet,
    ...result.published_date != null && result.published_date.length > 0 ? { publishedAt: result.published_date } : {},
  }
}

/**
 * Map a Tavily response envelope to a normalized search result.
 * `truncated` is always false — the seam owns `maxResults` truncation (capSources).
 */
export function mapTavilyResponse(response: TavilySearchResponse): WebSearchResult {
  const sources = (response.results ?? [])
    .map(mapTavilyResult)
    .filter((source): source is WebSearchSource => source !== undefined)
  return {
    ...response.answer != null && response.answer.length > 0 ? { content: response.answer } : {},
    sources,
    truncated: false,
  }
}

/** The Tavily-backed search provider; HTTP redirects fail as `WEB_PROVIDER_ERROR`. */
export class TavilySearchProvider implements WebSearchProvider {
  readonly id = TAVILY_PROVIDER_ID

  /** @param options - thunk projecting the current settings-section/composition value per search. */
  constructor(private readonly options: () => TavilySearchProviderOptions) {}

  available(): boolean {
    // resolveApiKey 是必选能力（apply 恒提供），key 解析能力恒在
    const o = this.options()
    return URL.canParse(o.baseURL)
      && (o.maxResults === undefined || (Number.isInteger(o.maxResults) && o.maxResults > 0))
  }

  async search(request: WebSearchRequest, signal?: AbortSignal): Promise<WebSearchResult> {
    // One snapshot for the whole operation: credential resolution awaits, and a
    // settings write landing inside that await must not send the key resolved
    // from the old section to the endpoint named by the new one.
    const o = this.options()
    const apiKey = o.apiKey ?? await o.resolveApiKey()
    if (apiKey === undefined || apiKey.length === 0) {
      throw new WebError('Tavily search requires an API key (configure it in Settings → Tavily 搜索)', 'WEB_PROVIDER_ERROR')
    }
    // A per-request bound wins over the configured default; either may be absent.
    const maxResults = request.maxResults ?? o.maxResults
    let response: Response
    try {
      response = await fetch(`${o.baseURL}/search`, {
        method: 'POST',
        redirect: 'error',
        headers: {
          'authorization': `Bearer ${apiKey}`,
          'content-type': 'application/json',
          'accept': 'application/json',
          'user-agent': USER_AGENT,
        },
        body: JSON.stringify({
          query: request.query,
          ...maxResults !== undefined ? { max_results: maxResults } : {},
          include_answer: true,
        }),
        ...signal !== undefined ? { signal } : {},
      })
    } catch (error: unknown) {
      abortWebError(error)
    }

    if (!response.ok) {
      const status = response.status
      let message = `Tavily API error (HTTP ${status})`
      try {
        const parsed = await response.json() as TavilyError
        const detail = parsed.error ?? parsed.message
        if (detail !== undefined && detail.length > 0) message = detail
      } catch (error: unknown) {
        abortWebError(error) // 中止要按 WEB_ABORTED 上报，不能被吞成 HTTP 错误
      }
      throw new WebError(message, 'WEB_PROVIDER_ERROR')
    }

    try {
      const payload = await response.json() as TavilySearchResponse
      return mapTavilyResponse(payload)
    } catch (error: unknown) {
      abortWebError(error)
    }
  }
}

/** 中止信号统一抛 WEB_ABORTED（fetch 或响应体解析阶段）。 */
function abortWebError(error: unknown): never {
  if (error instanceof DOMException && error.name === 'AbortError') {
    throw new WebError('Tavily search aborted', 'WEB_ABORTED', { cause: error })
  }
  throw new WebError(`Tavily search request failed: ${String(error)}`, 'WEB_PROVIDER_ERROR', { cause: error })
}
