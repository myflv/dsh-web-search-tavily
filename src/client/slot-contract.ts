/** 声明 settings.plugin.item slot（插件配置页卡片列表，宿主为官方 ui-settings-plugins）。 */
import type {} from '@deepseek-ai/dsh-client-ui-slots'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    'settings.plugin.item': { kind: 'list'; scope: 'root'; owner: SettingsPluginItemOwnerProps }
  }
}

/** 卡片 owner props（宿主不传内容）。 */
export interface SettingsPluginItemOwnerProps {
  children?: never
}
