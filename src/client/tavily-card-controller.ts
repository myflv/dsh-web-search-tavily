/**
 * The Tavily card's staged form over the `web-search-tavily` settings section:
 * baseURL/maxResults route through the settings scope, the apiKey through the
 * credentials domain under the reference the section names (default
 * `TAVILY_API_KEY`). Mirrors the official DeepSeek web-search card.
 */

import type { IApiClient } from '@deepseek-ai/dsh-api-remotes/client'
import type { SettingsScope } from '@deepseek-ai/dsh-client-runtime/client'

/** The search-provider fields this card edits. */
export interface TavilySettings {
  /** Credential reference naming the environment key. */
  apiKeyEnv?: string
  /** Provider endpoint; blank inherits the provider default. */
  baseURL?: string
  /** Default result count when a request carries no `maxResults`. */
  maxResults?: number
}

/** What the Tavily card renders. */
export interface TavilyCardState {
  /** Provider endpoint. */
  baseURL: string
  /** Default result count (empty = unset). */
  maxResults: string
  /** The staged credential, blank on every load. */
  apiKey: string
  /** Whether the Host reports a credential configured for the referenced key. */
  apiKeyConfigured: boolean
  /** Whether the credentials domain accepts a write; false disables the control. */
  apiKeyWritable: boolean
  /** Whether the settings section is writable. */
  writable: boolean
}

/** The registration-side face the card's slot entry injects. */
export interface TavilyCardFace {
  /** Card snapshot bound by the renderer. */
  tavilyCard: {
    subscribe(listener: () => void): () => void
    getState(): TavilyCardState
    save(edits: { baseURL?: string; maxResults?: string; apiKey?: string }): Promise<void>
  }
}

/** Bridges the `web-search-tavily` scope and the credentials domain onto the card. */
export class TavilyCardController {
  private state: TavilyCardState
  private readonly listeners = new Set<() => void>()
  private credential = { ref: '', configured: false, writable: true }

  constructor(
    private readonly scope: SettingsScope<TavilySettings>,
    private readonly api: Pick<IApiClient, 'credentials'>,
  ) {
    this.state = this.project()
    scope.subscribe(() => {
      this.state = this.project()
      void this.readCredential()
      this.emit()
    })
    void this.readCredential()
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  getState(): TavilyCardState {
    return this.state
  }

  /**
   * Commit staged edits: value fields through the settings scope, the key
   * through the credentials domain; then re-read the credential state.
   */
  async save(edits: { baseURL?: string; maxResults?: string; apiKey?: string }): Promise<void> {
    if (edits.baseURL !== undefined) await this.scope.set('baseURL', edits.baseURL)
    if (edits.maxResults !== undefined) {
      const n = edits.maxResults.trim()
      await this.scope.set('maxResults', n === '' ? null : Number(n))
    }
    if (edits.apiKey !== undefined && edits.apiKey.trim() !== '') {
      try {
        await this.api.credentials.set({ ref: refOf(this.scope.getSnapshot()), value: edits.apiKey.trim() })
      } catch {
        // Refusals surface through the re-read below: the Host is the only
        // authority on whether the key now exists.
      }
    }
    await this.readCredential()
    this.emit()
  }

  private project(): TavilyCardState {
    const section = this.scope.getSnapshot().value ?? {}
    return {
      baseURL: section.baseURL ?? '',
      maxResults: section.maxResults === undefined ? '' : String(section.maxResults),
      apiKey: '',
      apiKeyConfigured: this.credential.configured,
      apiKeyWritable: this.credential.writable,
      writable: this.scope.getSnapshot().writable !== false,
    }
  }

  /**
   * Ask the credentials domain about the reference the section currently names.
   * A response is published only while it still answers for the reference in
   * force (apiKeyEnv can change between request and response).
   */
  private async readCredential(): Promise<void> {
    const ref = refOf(this.scope.getSnapshot())
    if (ref !== this.credential.ref) {
      this.credential = { ref, configured: false, writable: true }
    }
    let response: Awaited<ReturnType<IApiClient['credentials']['describe']>>
    try {
      response = await this.api.credentials.describe({ refs: [ref] })
    } catch {
      return // the card stays usable: the control reports the last known state
    }
    if (!response.result.ok || ref !== refOf(this.scope.getSnapshot())) return
    const view = response.result.value.credentials[ref]
    const next = {
      ref,
      configured: view?.configured ?? false,
      writable: view?.writable ?? true,
    }
    if (next.configured === this.credential.configured && next.writable === this.credential.writable) return
    this.credential = next
    this.state = this.project()
    this.emit()
  }

  private emit(): void {
    for (const listener of [...this.listeners]) {
      try {
        listener()
      } catch (error) {
        console.error('[web-search-tavily] card listener threw:', error)
      }
    }
  }
}

/** The credential reference the section names, or the provider's default. */
function refOf(snapshot: ReturnType<SettingsScope<TavilySettings>['getSnapshot']>): string {
  const declared = snapshot.value?.apiKeyEnv
  return declared !== undefined && declared.length > 0 ? declared : 'TAVILY_API_KEY'
}
