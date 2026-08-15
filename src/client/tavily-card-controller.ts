// Tavily 设置控制器：三字段（apiKey/baseURL/maxResults）全部经设置域明文读写——
// 与 provider 的组合配置同源，UI 显示的值就是搜索实际用的值，可编辑可清空。

import type { SettingsScope } from '@deepseek-ai/dsh-client-runtime/client'

/** The search-provider fields this card edits. */
export interface TavilySettings {
  /** Tavily API key; blank inherits the composition layer (env patch). */
  apiKey?: string
  /** Provider endpoint; blank inherits the provider default. */
  baseURL?: string
  /** Default result count when a request carries no `maxResults`. */
  maxResults?: number
}

/** What the Tavily card renders. */
export interface TavilyCardState {
  /** Section value; undefined = not configured (inherits composition layer). */
  apiKey?: string
  /** Section value; undefined = not configured. */
  baseURL?: string
  /** Section value; undefined = not configured. */
  maxResults?: number
  /** 写死 true：settings 域 status/writable 不 ready 的历史行为（0382761 验证形态） */
  writable: boolean
}

/** One save's staged edits; blank strings clear the settings field. */
export interface TavilyCardEdits {
  /** Blank unsets the field (re-inherits the composition default). */
  apiKey: string
  /** Blank unsets the field. */
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

/** Bridges the `web-search-tavily` scope onto the card. */
export class TavilyCardController {
  private state: TavilyCardState
  private readonly listeners = new Set<() => void>()

  constructor(private readonly scope: SettingsScope<TavilySettings>) {
    this.state = this.project()
    scope.subscribe(() => {
      const next = this.project()
      if (this.changed(next)) {
        this.state = next
        this.emit()
      }
    })
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

  /** 一次写全部编辑：空 = unset（继承组合层），非空 = set（maxResults 转数字）。 */
  save = async (edits: TavilyCardEdits): Promise<boolean> => {
    const fields: Array<[keyof TavilySettings, string]> = [
      ['apiKey', edits.apiKey.trim()],
      ['baseURL', edits.baseURL.trim()],
      ['maxResults', edits.maxResults.trim()],
    ]
    try {
      // 同一 scope 的写顺序执行（revision fencing 不允许并行）
      for (const [field, text] of fields) {
        if (text === '') await this.scope.unset(field)
        else await this.scope.set(field, field === 'maxResults' ? Number(text) : text)
      }
      return true
    } catch {
      return false // 设置域写被拒（内存模式等）
    }
  }

  private project(): TavilyCardState {
    const value = this.scope.getSnapshot().value
    return {
      apiKey: value?.apiKey,
      baseURL: value?.baseURL,
      maxResults: value?.maxResults,
      writable: true,
    }
  }

  /** 投影与当前 state 逐字段相同则不通知（subscribe 热路径守卫）。 */
  private changed(next: TavilyCardState): boolean {
    const prev = this.state
    return next.apiKey !== prev.apiKey
      || next.baseURL !== prev.baseURL
      || next.maxResults !== prev.maxResults
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
