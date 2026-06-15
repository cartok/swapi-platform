import type { RunOptions } from 'axe-core'

type ResultTypes = [ResultType, ...ResultType[]]

type ResultType = NonNullable<ResultTypesParameter>[number]

type ResultTypesParameter = RunOptions['resultTypes']

export const issueResultTypes = ['violations', 'incomplete'] satisfies ResultTypes
