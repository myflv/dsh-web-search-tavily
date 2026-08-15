// Tavily 设置控制器：key 经凭据域读写（默认引用 TAVILY_API_KEY），
// baseURL/maxResults 经设置域读写。可用性写死 true（settings 域 status
// 不 ready 的历史行为，0382761 验证形态），编辑经组件本地草稿，save 一次提交。

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
  /** Section value; undefined = not configured (inherits composition layer). */
  baseURL?: string
  /** Section value; undefined = not configured. */
  maxResults?: number
}

/** One save's staged edits; blank strings clear the settings field. */
export interface TavilyCardEdits {
  /** Blank writes nothing, keeping the stored key. */
  apiKey: string
  /** Blank unsets the field (re-inherits the composition default). */
  baseURL: string
  /** Blank unsets the field; non-numeric blocks the save before it starts. */
  maxResults: string
}

/** The registration-side face the card's slot entry injects. */
export interface TavilyCardFace {
  /** Card snapshot bound by the renderer. */
  tavilyCard: {
    subscribe(listener: () => void): () => void
    getState(): TavilyCardState
    save(edits: TavilyCardEdits): Promise<boolean>
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
    // section 或凭据引用变化都重投影：baseURL/maxResults 可能被本卡或外部改
    scope.subscribe(() => {
      this.state = this.project()
      this.emit()
      if (refOf(this.scope.getSnapshot()) !== this.credential.ref) void this.readCredential()
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

  /** 一次写全部编辑：key 走凭据域，baseURL/maxResults 走设置域。 */
  save = async (edits: TavilyCardEdits): Promise<boolean> => {
    const key = edits.apiKey.trim()
    if (key !== '') {
      try {
        await this.api.credentials.set({ ref: refOf(this.scope.getSnapshot()), value: key })
      } catch {
        // Refusals surface through the re-read below: the Host is the only
        // authority on whether the key now exists.
      }
      await this.readCredential()
    }
    const baseURL = edits.baseURL.trim()
    const maxResults = edits.maxResults.trim()
    try {
      if (baseURL === '') await this.scope.unset('baseURL')
      else await this.scope.set('baseURL', baseURL)
      if (maxResults === '') await this.scope.unset('maxResults')
      else await this.scope.set('maxResults', Number(maxResults))
    } catch {
      return false // settings 写被拒（内存模式等）：整体视为未落盘
    }
    return this.credential.configured
  }

  private project(): TavilyCardState {
    const value = this.scope.getSnapshot().value
    return {
      apiKeyConfigured: this.credential.configured,
      apiKeyWritable: this.credential.writable,
      ...(value?.baseURL !== undefined ? { baseURL: value.baseURL } : {}),
      ...(value?.maxResults !== undefined ? { maxResults: value.maxResults } : {}),
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
