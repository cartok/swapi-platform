declare global {
  var ngServerMode: boolean | undefined
}
export function enableAngularServerMode(): void {
  global.ngServerMode = true
}
