/**
 * The `settings.plugin.item` slot type — one plugin's card inside the plugin
 * configuration tab (hosted by `@deepseek-ai/dsh-client-ui-settings-plugins`).
 * This package registers into that slot, so the slot name is declared here
 * via the standard SlotMap augmentation.
 */

import type {} from '@deepseek-ai/dsh-client-ui-slots'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    /** One plugin's card inside the plugin configuration tab. */
    'settings.plugin.item': { kind: 'list'; scope: 'root'; owner: SettingsPluginItemOwnerProps }
  }
}

/** Owner share of a plugin card (the section supplies nothing). */
export interface SettingsPluginItemOwnerProps {
  /** Marker field: card owner props are intentionally empty. */
  children?: never
}
