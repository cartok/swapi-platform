/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  options: {
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    parser: 'tsc',
    combinedDependencies: true,
    cache: true,
    doNotFollow: {
      path: ['node_modules'],
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['types'],
      extensions: ['.ts', '.json'],
    },
  },
}
