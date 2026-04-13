const angularCompiler = await import('@angular/compiler')

if (!angularCompiler.VERSION.full) {
  throw new Error('Angular compiler failed to load.')
}

await import('./server.js')
