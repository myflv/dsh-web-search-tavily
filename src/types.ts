/**
 * Tavily search API response types (https://docs.tavily.com/documentation/api-reference/endpoint/search).
 * Only the fields the provider consumes are modeled.
 */

/** One entry of Tavily's `results[]`. */
export interface TavilyResult {
  readonly title: string
  readonly url: string
  /** Retrieved page content / snippet. */
  readonly content: string
  readonly score: number
  /** ISO-8601 publish date, absent for undated pages. */
  readonly published_date?: string
}

export interface TavilySearchResponse {
  /** Generated answer; present only when the request asked for one. */
  readonly answer?: string
  readonly results: TavilyResult[]
}

export interface TavilyError {
  readonly error?: string
  readonly message?: string
}
