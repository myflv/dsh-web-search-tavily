/**
 * Browser half: registers the Tavily card into the settings shell as an
 * independent section (settings.section — the shell's own declaration, stable
 * across plugin sets; the plugins-tab card slot is nested deeper and harder
 * to reach). The card edits the `web-search-tavily` settings section and the
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

/** Register the Tavily settings section. */
export function apply(ctx: ClientContext): void {
  const t = ctx.locale.bind(NS)
  // Controller is a singleton owned by this plugin fiber (official pattern):
  // constructed once at apply, its face is shared by every render.
  const { api } = ctx.get('connection') as ConnectionHandle
  const controller = new TavilyCardController(
    ctx.settingsScope.bind({ namespace: NS }),
    api,
  )
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'web-search-tavily: section locale')

  // Appears in the Settings shell once the shell's declaration is on the
  // ledger (slots.inject waits for it); the section edits the plugin's
  // settings namespace and the credential it references.
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section',
    id: NS,
    order: 100,
    label: () => t('nav'),
    locale: NS,
    inject: () => ({ tavilyCard: controller }),
  }, TavilyCard))
}
