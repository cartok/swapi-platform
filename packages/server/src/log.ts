export function header(headerText: string): string {
  const result = `[ ${headerText.toUpperCase()} ]\n`
  return result
}

export function objectToString(object: object): string {
  const result = Object.entries(object).reduce(
    (acc, [key, value]) => acc + `  ${key}: ${value}` + '\n',
    '',
  )
  return result
}
