// 浏览器半：注册插件配置页卡片（settings.plugin.item），三字段（apiKey/
// baseURL/maxResults）明文编辑 web-search-tavily 配置域。

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Side-effect type imports: augment the Context face (settingsScope, slots,
// locale) and the SlotMap（含 settings.plugin.item 声明）。
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings-plugins/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
const { TavilyCardController } = require('./tavily-card-controller.js') as typeof import('./tavily-card-controller.js')
const { TavilyCard } = require('./TavilyCard.js') as typeof import('./TavilyCard.js')
const { en, NS, zh } = require('./locales.js') as typeof import('./locales.js')

/** Cordis plugin name (matches the host half and the boot row id). */
export const name = 'web-search-tavily'

/** Services this browser plugin needs. */
export const inject = ['slots', 'locale', 'settingsScope']

/** Register the Tavily settings section. */
export function apply(ctx: ClientContext): void {
  // Controller is a singleton owned by this plugin fiber (official pattern):
  // constructed once at apply, its face is shared by every render.
  const controller = new TavilyCardController(ctx.settingsScope.bind({ namespace: NS }))
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'web-search-tavily: section locale')

  // 插件配置页卡片（官方 PluginCard 的 <li> 形态，plugin.item slot 天然契合）
  ctx.slots.inject('settings.plugin.item', () => ctx.slots.register({
    name: 'settings.plugin.item',
    id: NS,
    order: 1,
    locale: NS,
    inject: () => ({ tavilyCard: controller }),
  }, TavilyCard))
}
