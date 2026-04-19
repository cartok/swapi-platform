const angularCompiler = await import('@angular/compiler')

if (!angularCompiler.VERSION.full) {
  throw new Error('Angular compiler failed to load.')
}

const { default: bunServerOptions } = await import('./server.js')

export default bunServerOptions
