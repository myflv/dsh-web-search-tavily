// Tavily 设置控制器：key 经凭据域读写（默认引用 TAVILY_API_KEY），对齐官方 DeepSeek 卡片。

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
  /** Whether the Host reports a credential configured for the referenced key. */
  apiKeyConfigured: boolean
  /** Whether the credentials domain accepts a write; false disables the control. */
  apiKeyWritable: boolean
}

/** The registration-side face the card's slot entry injects. */
export interface TavilyCardFace {
  /** Card snapshot bound by the renderer. */
  tavilyCard: {
    subscribe(listener: () => void): () => void
    getState(): TavilyCardState
    save(apiKey: string): Promise<void>
    unsetKey(): Promise<void>
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
    // settings 变更不可能改凭据（只经本卡 set/unset），仅在 apiKeyEnv 引用变化时重读
    scope.subscribe(() => {
      this.state = this.project()
      if (refOf(this.scope.getSnapshot()) !== this.credential.ref) void this.readCredential()
      this.emit()
    })
    void this.readCredential()
  }

  // Arrow-function properties bind `this` to the instance: the face is
  // passed to useSyncExternalStore as a bare function reference.
  subscribe = (listener: () => void): () => void => {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  getState = (): TavilyCardState => {
    return this.state
  }

  /** key 在本卡片之外被写/删（CLI、凭据文件）时刷新徽标状态。 */
  refreshCredential = (ref: string): void => {
    if (ref !== this.credential.ref) return
    void this.readCredential()
  }

  /** 写 key 到凭据域（空值忽略），随后重读凭据状态。 */
  save = async (apiKey: string): Promise<void> => {
    const value = apiKey.trim()
    if (value === '') return
    try {
      await this.api.credentials.set({ ref: refOf(this.scope.getSnapshot()), value })
    } catch {
      // Refusals surface through the re-read below: the Host is the only
      // authority on whether the key now exists.
    }
    await this.readCredential()
    this.emit()
  }

  /** Remove the configured key through the credentials domain. */
  unsetKey = async (): Promise<void> => {
    try {
      await this.api.credentials.unset({ ref: refOf(this.scope.getSnapshot()) })
    } catch {
      // Refusals surface through the re-read below.
    }
    await this.readCredential()
    this.emit()
  }

  private project(): TavilyCardState {
    return {
      apiKeyConfigured: this.credential.configured,
      apiKeyWritable: this.credential.writable,
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
