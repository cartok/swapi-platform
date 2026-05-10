import { PATHS } from '#internal/routing/paths'

const ERROR_PAGE_PATH = `/${PATHS.SSG.ERROR_PATH}`

export function isErrorPagePath(pathname: string): boolean {
  return pathname === ERROR_PAGE_PATH
}
