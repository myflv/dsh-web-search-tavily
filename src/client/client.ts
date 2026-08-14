/**
 * Browser half: registers the Tavily card into the settings plugins tab.
 * Activation is bundle-driven (the same package's `dsh.bundle` patch inserts
 * the host entry; the `dsh.client` declaration puts this half in the boot
 * manifest). The card edits the `web-search-tavily` settings section and the
 * `TAVILY_API_KEY` credential.
 */

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { ConnectionHandle } from '@deepseek-ai/dsh-client-connection/client'
// Side-effect type imports: these packages augment the Context face
// (settingsScope, slots, locale) and the SlotMap.
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
const { TavilyCardController } = require('./tavily-card-controller.js') as typeof import('./tavily-card-controller.js')
const { TavilyCard } = require('./TavilyCard.js') as typeof import('./TavilyCard.js')
const { en, NS, zh } = require('./locales.js') as typeof import('./locales.js')

/** Cordis plugin name (matches the host half and the boot row id). */
export const name = 'web-search-tavily'

/** Services this browser plugin needs. */
export const inject = ['slots', 'locale', 'settingsScope', 'connection']

/** Register the Tavily card into the settings plugins tab. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'web-search-tavily: card locale')

  ctx.slots.inject('settings.plugin.item', () => {
    const { api } = ctx.get('connection') as ConnectionHandle
    const controller = new TavilyCardController(
      ctx.settingsScope.bind({ namespace: NS }),
      api,
    )
    return ctx.slots.register({
      name: 'settings.plugin.item',
      id: NS,
      order: 1,
      locale: NS,
      inject: () => ({ tavilyCard: controller }),
    }, TavilyCard)
  })
}
