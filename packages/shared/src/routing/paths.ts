export const PATHS = Object.freeze({
  SSG: {
    HOME_PATH: '',
    ERROR_PATH: 'error',
  },
  SSR: {
    MOVIES: 'movies',
    MOVIE: 'movie/:id',
    CHARACTERS: 'characters',
    CHARACTER: 'character/:id',
    PLANETS: 'planets',
    PLANET: 'planet/:id',
  },
} as const)
