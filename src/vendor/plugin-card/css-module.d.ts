/** CSS Modules 声明：构建时由 esbuild 插件编译成类名映射。 */
declare module '*.module.css' {
  const classes: Record<string, string>
  export default classes
}
