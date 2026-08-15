/** 官方 card-form.ts 的 CardShell（复制，避免引入官方包内部模块）。 */
export interface CardShell {
  available: boolean
  writable: boolean
  dirty: boolean
  invalid: boolean
  saving: boolean
  failed: boolean
}
