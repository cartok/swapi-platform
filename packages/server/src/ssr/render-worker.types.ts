// Values

export type RenderJobId = number

export type RenderResult = string
export type WorkerAbortReason = 'client-abort' | 'request-timeout' | 'render-timeout'

// Requests

export type WorkerRequest = WorkerWarmupRequest | WorkerRenderRequest | WorkerAbortRequest

export type WorkerWarmupRequest = WorkerRequestType<{
  type: 'warmup'
}>

export type WorkerRenderRequest = WorkerRequestType<{
  type: 'render'
  id: RenderJobId
  url: string
}>

export type WorkerAbortRequest = WorkerRequestType<{
  type: 'abort'
  id: RenderJobId
  reason: WorkerAbortReason
}>

type WorkerRequestType<T extends { type: string }> = T

// Responses

export type WorkerResponse =
  | WorkerWarmedUpResponse
  | WorkerWarmupErrorResponse
  | WorkerJobResponse

export type WorkerWarmedUpResponse = WorkerResponseType<{
  type: 'warmed-up'
  threadId: number
}>

export type WorkerWarmupErrorResponse = WorkerResponseType<{
  type: 'warmup-error'
  threadId: number
  error: Error
}>

export type WorkerRenderResponse = WorkerJobResponseType<{
  type: 'rendered'
  threadId: number
  id: RenderJobId
  html: RenderResult
}>

export type WorkerRenderAbortResponse = WorkerJobResponseType<{
  type: 'render-aborted-by-signal'
  threadId: number
  id: RenderJobId
  reason: AbortSignal['reason']
}>

export type WorkerRenderErrorResponse = WorkerJobResponseType<{
  type: 'render-error'
  threadId: number
  id: RenderJobId
  error: Error
}>

export type WorkerJobResponse =
  | WorkerRenderResponse
  | WorkerRenderAbortResponse
  | WorkerRenderErrorResponse

type WorkerResponseType<T extends { type: string; threadId: number }> = T

type WorkerJobResponseType<
  T extends { type: string; threadId: number; id: RenderJobId },
> = WorkerResponseType<T>
